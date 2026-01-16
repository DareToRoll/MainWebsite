import { Request, Response } from 'express'
import { createPaymentRequest, verifyPaymentResponse } from '../services/paymentService'

/**
 * Initiate a payment - generates payment form data
 */
export async function initiatePayment(req: Request, res: Response) {
    try {
        const { amount, orderId, customerEmail } = req.body || {}

        if (!amount || !orderId) {
            return res.status(400).json({
                error: 'Les champs amount et orderId sont obligatoires.',
            })
        }

        const numericAmount = Number(amount)
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({
                error: 'Le montant doit être un nombre positif.',
            })
        }

        const paymentData = await createPaymentRequest({
            amount: numericAmount,
            orderId: String(orderId).trim(),
            customerEmail: customerEmail ? String(customerEmail).trim() : undefined,
        })

        return res.status(200).json(paymentData)
    } catch (error) {
        console.error('Erreur initiatePayment:', error)
        return res.status(500).json({
            error: "Une erreur s'est produite lors de l'initialisation du paiement.",
        })
    }
}

/**
 * Handle payment response/callback from Sherlock's
 */
export async function handlePaymentResponse(req: Request, res: Response) {
    try {
        // Sherlock's can send data via POST body or query params
        const responseData = { ...req.query, ...req.body }

        const verificationResult = await verifyPaymentResponse(responseData)

        if (!verificationResult.isValid) {
            return res.status(400).json({
                error: 'Signature de réponse invalide.',
                details: verificationResult.error,
            })
        }

        // Here you would typically:
        // - Update order status in database
        // - Send confirmation email
        // - Log the transaction

        return res.status(200).json({
            success: true,
            transactionId: verificationResult.transactionId,
            orderId: verificationResult.orderId,
            status: verificationResult.status,
        })
    } catch (error) {
        console.error('Erreur handlePaymentResponse:', error)
        return res.status(500).json({
            error: "Une erreur s'est produite lors du traitement de la réponse de paiement.",
        })
    }
}
