import { Request, Response } from 'express';
import { createSherlockPaypage, PaymentOutcome } from '../services/paymentService';
import { env } from '../config/env';

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
        const { amount, orderId, customerEmail, returnContext } = req.body || {};

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

        // Build callback URLs - handle Railway SSL termination
        // Check X-Forwarded-Proto header for proper protocol detection behind proxy
        const protocol = req.get('X-Forwarded-Proto') || req.protocol;
        const backendBaseUrl = protocol + '://' + req.get('host');
        const normalReturnUrl = `${backendBaseUrl}/api/payment/return`;
        const automaticResponseUrl = `${backendBaseUrl}/api/payment/auto`;

        console.log('[Payment Init] Backend base URL:', backendBaseUrl);
        console.log('[Payment Init] Normal return URL:', normalReturnUrl);

        console.log('[Payment Init] Amount:', numericAmount, 'OrderId:', orderId, 'Email:', customerEmail);

        const response = await sherlockPaypage.initPayment({
            amount: numericAmount,
            orderId: orderId ? String(orderId).trim() : undefined,
            returnContext: returnContext ? String(returnContext) : undefined,
            customerEmail: customerEmail ? String(customerEmail).trim() : undefined,
            customerContactEmail: customerEmail ? String(customerEmail).trim() : undefined,
            normalReturnUrl,
            automaticResponseUrl,
        });

        console.log('[Payment Init] Response code:', response.redirectionStatusCode);

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

        console.log('[Payment Init] Success, redirectionUrl:', redirectionFields.redirectionUrl);

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
    console.log('[Payment Return] Handler called');
    console.log('[Payment Return] Request method:', req.method);
    console.log('[Payment Return] Request path:', req.path);
    
    try {
        // Log raw body for debugging
        console.log('[Payment Return] Raw body keys:', Object.keys(req.body || {}));
        console.log('[Payment Return] Content-Type:', req.get('Content-Type'));
        console.log('[Payment Return] Body:', JSON.stringify(req.body, null, 2));

        const { Data, Seal, Encode, InterfaceVersion } = req.body || {};

        console.log('[Payment Return] Received callback');
        console.log('[Payment Return] Data present:', !!Data);
        console.log('[Payment Return] Seal present:', !!Seal);
        console.log('[Payment Return] Encode:', Encode);
        console.log('[Payment Return] InterfaceVersion:', InterfaceVersion);

        if (!Data || !Seal) {
            console.error('[Payment Return] Missing Data or Seal');
            console.error('[Payment Return] Data:', Data ? 'present' : 'missing');
            console.error('[Payment Return] Seal:', Seal ? 'present' : 'missing');
            return res.redirect(`${env.FRONTEND_BASE_URL}/payment-result?status=error&reason=missing_fields`);
        }

        // Verify callback seal
        console.log('[Payment Return] Verifying seal...');
        const verification = sherlockPaypage.verifyAndParseCallback({ Data, Seal, Encode, InterfaceVersion });

        console.log('[Payment Return] Verification result:', verification.ok);
        if (!verification.ok) {
            console.error('[Payment Return] Seal verification failed');
            console.error('[Payment Return] Expected:', verification.expectedSeal);
            console.error('[Payment Return] Provided:', verification.providedSeal);
            console.error('[Payment Return] Data raw:', verification.dataRaw.substring(0, 100));
            return res.redirect(`${env.FRONTEND_BASE_URL}/payment-result?status=error&reason=invalid_seal`);
        }

        // Determine outcome
        console.log('[Payment Return] Parsing outcome...');
        const outcome = sherlockPaypage.getOutcomeFromCallback(verification.parsed);

        console.log('[Payment Return] Outcome:', outcome.status, 'ResponseCode:', outcome.responseCode);

        // Redirect to frontend with outcome
        const queryParams = new URLSearchParams({
            status: outcome.status,
            responseCode: outcome.responseCode ?? '',
            transactionReference: outcome.transactionReference ?? '',
            customerId: outcome.customerId ?? '',
        });

        const redirectUrl = `${env.FRONTEND_BASE_URL}/payment-result?${queryParams.toString()}`;
        console.log('[Payment Return] Redirecting to:', redirectUrl);
        console.log('[Payment Return] FRONTEND_BASE_URL:', env.FRONTEND_BASE_URL);

        return res.redirect(redirectUrl);
    } catch (error) {
        console.error('[Payment Return] Error:', error);
        console.error('[Payment Return] Error name:', error instanceof Error ? error.name : 'unknown');
        console.error('[Payment Return] Error message:', error instanceof Error ? error.message : String(error));
        console.error('[Payment Return] Error stack:', error instanceof Error ? error.stack : 'no stack');
        
        // Ensure we have FRONTEND_BASE_URL even in error case
        const errorRedirect = env.FRONTEND_BASE_URL 
            ? `${env.FRONTEND_BASE_URL}/payment-result?status=error&reason=server_error`
            : '/payment-result?status=error&reason=server_error';
        
        console.error('[Payment Return] Error redirect URL:', errorRedirect);
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

        console.log('[Payment Auto] Received callback');

        if (!Data || !Seal) {
            console.error('[Payment Auto] Missing Data or Seal');
            return res.status(400).json({ error: 'Missing Data or Seal' });
        }

        // Verify callback seal
        const verification = sherlockPaypage.verifyAndParseCallback({ Data, Seal, Encode, InterfaceVersion });

        if (!verification.ok) {
            console.error('[Payment Auto] Seal verification failed');
            console.error('[Payment Auto] Expected:', verification.expectedSeal);
            console.error('[Payment Auto] Provided:', verification.providedSeal);
            return res.status(400).json({ error: 'Invalid seal' });
        }

        // Determine outcome
        const outcome = sherlockPaypage.getOutcomeFromCallback(verification.parsed);

        console.log('[Payment Auto] Outcome:', outcome.status, 'ResponseCode:', outcome.responseCode, 'TransactionRef:', outcome.transactionReference);

        // Here you would typically:
        // - Update order status in database
        // - Send confirmation email
        // - Log the transaction
        // - Trigger fulfillment process

        // For now, just acknowledge receipt
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
