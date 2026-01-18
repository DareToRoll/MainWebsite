import crypto from 'crypto'
import { env } from '../config/env'

interface PaymentRequestParams {
    amount: number
    orderId: string
    customerEmail?: string
}

interface PaymentData {
    paymentUrl: string
    formData: Record<string, string>
}

interface VerificationResult {
    isValid: boolean
    transactionId?: string
    orderId?: string
    status?: string
    error?: string
}

/**
 * Generate HMAC-SHA256 signature for Sherlock's Sips
 */
/* function generateSeal(data: string): string {
    return crypto
        .createHmac('sha256', env.SHERLOCK_SECRET_KEY)
        .update(data)
        .digest('hex')
} */

/**
 * Create payment request data with proper signature
 */
/* export async function createPaymentRequest(
    params: PaymentRequestParams,
): Promise<PaymentData> {
    const { amount, orderId, customerEmail } = params

    // Amount must be in cents (e.g., 10.50 EUR = 1050)
    const amountInCents = Math.round(amount * 100)

    // Prepare payment data according to Sherlock's Sips Paypage specifications
    const formData: Record<string, string> = {
        merchantId: env.SHERLOCK_MERCHANT_ID,
        keyVersion: env.SHERLOCK_KEY_VERSION,
        transactionReference: orderId,
        amount: amountInCents.toString(),
        currencyCode: '978', // EUR (ISO 4217)
        normalReturnUrl: env.SHERLOCK_RETURN_URL,
        automaticResponseUrl: env.SHERLOCK_CALLBACK_URL,
        orderChannel: 'INTERNET',
        interfaceVersion: 'HP_2.30', // Sherlock's Sips Paypage version
    }

    // Add optional customer email
    if (customerEmail) {
        formData.customerEmail = customerEmail
    }

    // Generate data string for signature (fields must be in alphabetical order)
    const sortedKeys = Object.keys(formData).sort()
    const dataString = sortedKeys.map((key) => `${key}=${formData[key]}`).join('|')

    // Generate seal (HMAC signature)
    const seal = generateSeal(dataString)
    formData.seal = seal

    return {
        paymentUrl: env.SHERLOCK_PAYMENT_URL,
        formData,
    }
}
 */
/**
 * Verify payment response signature from Sherlock's
 */
/* export async function verifyPaymentResponse(
    responseData: Record<string, any>,
): Promise<VerificationResult> {
    try {
        const receivedSeal = responseData.Seal || responseData.seal

        if (!receivedSeal) {
            return {
                isValid: false,
                error: 'Aucune signature trouvée dans la réponse.',
            }
        }

        // Extract relevant fields from response
        const {
            Seal,
            seal,
            InterfaceVersion,
            ...dataToVerify
        } = responseData

        // Build data string for verification (alphabetically sorted)
        const sortedKeys = Object.keys(dataToVerify).sort()
        const dataString = sortedKeys
            .map((key) => `${key}=${dataToVerify[key]}`)
            .join('|')

        // Calculate expected seal
        const expectedSeal = generateSeal(dataString)

        // Verify signature
        if (expectedSeal !== receivedSeal) {
            return {
                isValid: false,
                error: 'Signature invalide - possible tentative de fraude.',
            }
        }

        // Extract transaction details
        const transactionId = responseData.transactionReference || responseData.orderId
        const responseCode = responseData.responseCode
        const status = responseCode === '00' ? 'success' : 'failed'

        return {
            isValid: true,
            transactionId,
            orderId: transactionId,
            status,
        }
    } catch (error) {
        console.error('Error verifying payment response:', error)
        return {
            isValid: false,
            error: 'Erreur lors de la vérification de la signature.',
        }
    }
} */
