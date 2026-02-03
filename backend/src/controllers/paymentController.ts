import { Request, Response } from 'express';
import { createSherlockPaypage, PaymentOutcome } from '../services/paymentService';
import { env } from '../config/env';
import { storePaymentResult, getPaymentResult as getStoredResult, deletePaymentResult } from '../services/paymentResultStore';
import { storeOrderContext, getOrderContext } from '../services/orderContextStore';
import { sendPaymentConfirmationEmail } from '../services/mailService';
import crypto from 'crypto';

const sherlockPaypage = createSherlockPaypage({
    paymentInitUrl: env.SHERLOCK_PAYMENT_INIT_URL,
    secretKey: env.SHERLOCK_SECRET_KEY,
    merchantId: env.SHERLOCK_MERCHANT_ID,
    keyVersion: env.SHERLOCK_KEY_VERSION,
    interfaceVersion: env.SHERLOCK_INTERFACE_VERSION,
    sealAlgorithm: env.SHERLOCK_SEAL_ALGORITHM,
    transactionKeyMode: env.SIPS_TRANSACTION_KEY_MODE,
    timeoutMs: 15000,
});

/**
 * POST /api/payment/init
 * Initiate a payment - generates redirection fields for Sherlock's Paypage
 */
export async function initiatePayment(req: Request, res: Response) {
    try {
        const { amount, orderId, customerEmail, orderContext } = req.body || {};

        if (!amount) {
            return res.status(400).json({
                error: 'Le champ amount est obligatoire.',
            });
        }

        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({
                error: 'Le montant doit être un nombre positif.',
            });
        }

        if (process.env.NODE_ENV !== 'production') {
            console.log('[Payment Init] Amount received (cents):', numericAmount);
            console.log('[Payment Init] Amount in euros:', (numericAmount / 100).toFixed(2));
        }

        // Store order context if provided
        if (orderContext && orderId) {
            storeOrderContext(orderId, orderContext);
        }

        // Build callback URLs - handle Railway SSL termination
        // Check X-Forwarded-Proto header for proper protocol detection behind proxy
        const protocol = req.get('X-Forwarded-Proto') || req.protocol;
        const backendBaseUrl = protocol + '://' + req.get('host');
        const normalReturnUrl = `${backendBaseUrl}/api/payment/return`;
        const automaticResponseUrl = `${backendBaseUrl}/api/payment/auto`;

        const response = await sherlockPaypage.initPayment({
            amount: numericAmount,
            orderId: orderId ? String(orderId).trim() : undefined,
            customerEmail: customerEmail ? String(customerEmail).trim() : undefined,
            customerContactEmail: customerEmail ? String(customerEmail).trim() : undefined,
            normalReturnUrl,
            automaticResponseUrl,
        });

        // Check for init errors (94, 99, etc.)
        if (response.redirectionStatusCode !== '00') {
            console.error('[Payment Init] Failed:', response.redirectionStatusCode, response.redirectionStatusMessage);
            return res.status(400).json({
                error: `Erreur lors de l'initialisation du paiement: ${response.redirectionStatusMessage ?? response.redirectionStatusCode}`,
                code: response.redirectionStatusCode,
            });
        }

        // Extract redirection fields
        const redirectionFields = sherlockPaypage.requireInitSuccess(response);

        return res.status(200).json({
            success: true,
            redirectionUrl: redirectionFields.redirectionUrl,
            redirectionData: redirectionFields.redirectionData,
            redirectionVersion: redirectionFields.redirectionVersion,
        });
    } catch (error) {
        console.error('[Payment Init] Error:', error);
        return res.status(500).json({
            error: "Une erreur s'est produite lors de l'initialisation du paiement.",
            details: error instanceof Error ? error.message : String(error),
        });
    }
}

/**
 * POST /api/payment/return
 * Handle normalReturnUrl callback from Sherlock's (user-facing redirect)
 */
export async function handleNormalReturn(req: Request, res: Response) {
    try {
        const { Data, Seal, Encode, InterfaceVersion } = req.body || {};

        if (!Data || !Seal) {
            const errorToken = crypto.randomBytes(16).toString('hex');
            storePaymentResult(errorToken, {
                status: 'error',
            });

            return res.redirect(`${env.FRONTEND_BASE_URL}/payment-result?token=${errorToken}`);
        }

        const verification = sherlockPaypage.verifyAndParseCallback({ Data, Seal, Encode, InterfaceVersion });

        if (!verification.ok) {
            const errorToken = crypto.randomBytes(16).toString('hex');
            storePaymentResult(errorToken, {
                status: 'error',
            });

            return res.redirect(`${env.FRONTEND_BASE_URL}/payment-result?token=${errorToken}`);
        }

        const outcome = sherlockPaypage.getOutcomeFromCallback(verification.parsed);

        // Extract orderId from callback
        let orderId: string | undefined;
        if (verification.parsed.kind === 'json' || verification.parsed.kind === 'kv') {
            const orderIdValue = verification.parsed.value['orderId'];
            if (typeof orderIdValue === 'string') {
                orderId = orderIdValue;
            }
        }

        // Generate secure token for result storage
        const token = crypto.randomBytes(16).toString('hex');
        console.log('[Payment Return] Generated token:', token);
        
        // Store result in memory (TTL handled by store)
        storePaymentResult(token, {
            status: outcome.status,
            responseCode: outcome.responseCode,
            transactionReference: outcome.transactionReference,
            customerId: outcome.customerId,
            orderId,
        });

        const redirectUrl = `${env.FRONTEND_BASE_URL}/payment-result?token=${token}`;

        return res.redirect(redirectUrl);
    } catch (error) {
        const errorToken = crypto.randomBytes(16).toString('hex');
        storePaymentResult(errorToken, {
            status: 'error',
        });

        const errorRedirect = env.FRONTEND_BASE_URL 
            ? `${env.FRONTEND_BASE_URL}/payment-result?token=${errorToken}`
            : `/payment-result?token=${errorToken}`;
        
        return res.redirect(errorRedirect);
    }
}

/**
 * POST /api/payment/auto
 * Handle automaticResponseUrl callback from Sherlock's (server-to-server)
 */
export async function handleAutomaticResponse(req: Request, res: Response) {
    try {
        const { Data, Seal, Encode, InterfaceVersion } = req.body || {};

        if (!Data || !Seal) {
            console.error('[Payment Auto] Missing Data or Seal');
            return res.status(400).json({ error: 'Missing Data or Seal' });
        }

        const verification = sherlockPaypage.verifyAndParseCallback({ Data, Seal, Encode, InterfaceVersion });

        if (!verification.ok) {
            return res.status(400).json({ error: 'Invalid seal' });
        }

        // Determine outcome
        const outcome = sherlockPaypage.getOutcomeFromCallback(verification.parsed);

        // Send confirmation email on success
        if (outcome.responseCode === '00') {
            // Extract orderId from parsed callback
            let orderId: string | undefined;
            if (verification.parsed.kind === 'json' || verification.parsed.kind === 'kv') {
                const orderIdValue = verification.parsed.value['orderId'];
                if (typeof orderIdValue === 'string') {
                    orderId = orderIdValue;
                }
            }

            if (orderId) {
                const orderContext = getOrderContext(orderId);
                if (orderContext) {
                    // Send email asynchronously (best effort - don't block response)
                    sendConfirmationEmail(orderContext).catch(err => {
                        console.error('[Payment Auto] Failed to send confirmation email:', err);
                    });
                } else {
                    console.warn('[Payment Auto] Order context not found for orderId:', orderId);
                }
            }
        }

        // Acknowledge receipt
        return res.status(200).json({
            success: true,
            status: outcome.status,
            responseCode: outcome.responseCode,
            transactionReference: outcome.transactionReference,
        });
    } catch (error) {
        console.error('[Payment Auto] Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error),
        });
    }
}

async function sendConfirmationEmail(orderContext: any): Promise<void> {
    const formatPrice = (amount: number): string => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    const donation = orderContext.totals.donation || 0;

    const dynamicTemplateData = {
        customer: {
            first_name: orderContext.customer.firstName,
        },
        order: {
            id: orderContext.orderId,
            date: new Date().toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
        },
        items: orderContext.items.map((item: any) => ({
            name: item.title,
            quantity: item.quantity,
            price_formatted: formatPrice(item.priceValue),
        })),
        totals: {
            subtotal_formatted: formatPrice(orderContext.totals.subtotal),
            shipping_formatted: formatPrice(orderContext.totals.shipping),
            ...(donation > 0 && { donation_formatted: formatPrice(donation) }),
            tax_formatted: formatPrice(orderContext.totals.tax),
            total_formatted: formatPrice(orderContext.totals.total),
        },
        brand: {
            name: 'Dare To Roll',
        },
        support: {
            email: env.SENDGRID_FROM_EMAIL,
        },
    };

    await sendPaymentConfirmationEmail(
        orderContext.customer.email,
        dynamicTemplateData
    );
}

/**
 * POST /api/payment/retry
 * Retry a payment using stored order context
 */
export async function retryPayment(req: Request, res: Response) {
    try {
        const { orderId } = req.body || {};

        if (!orderId) {
            return res.status(400).json({
                error: 'Le champ orderId est obligatoire.',
            });
        }

        // Retrieve stored order context
        const orderContext = getOrderContext(orderId);
        if (!orderContext) {
            return res.status(404).json({
                error: 'Commande introuvable ou expirée.',
            });
        }

        // Build callback URLs
        const protocol = req.get('X-Forwarded-Proto') || req.protocol;
        const backendBaseUrl = protocol + '://' + req.get('host');
        const normalReturnUrl = `${backendBaseUrl}/api/payment/return`;
        const automaticResponseUrl = `${backendBaseUrl}/api/payment/auto`;

        // Calculate amount in cents
        const amountInCents = Math.round(orderContext.totals.total * 100);

        const response = await sherlockPaypage.initPayment({
            amount: amountInCents,
            orderId: orderContext.orderId,
            customerEmail: orderContext.customer.email,
            customerContactEmail: orderContext.customer.email,
            normalReturnUrl,
            automaticResponseUrl,
        });

        // Check for init errors
        if (response.redirectionStatusCode !== '00') {
            console.error('[Payment Retry] Failed:', response.redirectionStatusCode, response.redirectionStatusMessage);
            return res.status(400).json({
                error: `Erreur lors de l'initialisation du paiement: ${response.redirectionStatusMessage ?? response.redirectionStatusCode}`,
                code: response.redirectionStatusCode,
            });
        }

        // Extract redirection fields
        const redirectionFields = sherlockPaypage.requireInitSuccess(response);

        return res.status(200).json({
            success: true,
            redirectionUrl: redirectionFields.redirectionUrl,
            redirectionData: redirectionFields.redirectionData,
            redirectionVersion: redirectionFields.redirectionVersion,
        });
    } catch (error) {
        console.error('[Payment Retry] Error:', error);
        return res.status(500).json({
            error: "Une erreur s'est produite lors de la réinitialisation du paiement.",
            details: error instanceof Error ? error.message : String(error),
        });
    }
}

/**
 * GET /api/payment/result
 * Retrieve payment result from token (one-time read)
 */
export async function getPaymentResult(req: Request, res: Response) {
    console.log('[Payment Result] GET /api/payment/result called');
    console.log('[Payment Result] Query params:', req.query);
    
    try {
        // Get token from query parameter (frontend and backend on different domains)
        const token = req.query.token as string;
        console.log('[Payment Result] Token from query:', token ? 'present' : 'missing');

        if (!token || typeof token !== 'string') {
            console.log('[Payment Result] No token found, returning 404');
            return res.status(404).json({
                error: 'Payment result not found',
            });
        }

        console.log('[Payment Result] Looking up result for token:', token);
        const result = getStoredResult(token);
        console.log('[Payment Result] Result from store:', result ? 'found' : 'not found');

        if (!result) {
            console.log('[Payment Result] Result not found or expired');
            return res.status(404).json({
                error: 'Payment result expired or not found',
            });
        }

        console.log('[Payment Result] Returning result:', result.status);
        // Delete token after reading (one-time use)
        deletePaymentResult(token);

        return res.status(200).json({
            success: true,
            status: result.status,
            responseCode: result.responseCode,
            transactionReference: result.transactionReference,
            customerId: result.customerId,
            orderId: result.orderId,
        });
    } catch (error) {
        console.error('[Payment Result] Error:', error);
        console.error('[Payment Result] Error stack:', error instanceof Error ? error.stack : 'no stack');
        return res.status(500).json({
            error: 'Internal server error',
        });
    }
}
