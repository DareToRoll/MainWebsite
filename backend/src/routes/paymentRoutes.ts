import { Router } from 'express'
/* import {
    initiatePayment,
    handlePaymentResponse,
} from '../controllers/paymentController' */

const router = Router()

// Initiate a new payment
/* router.post('/payment/initiate', initiatePayment)

// Handle payment response/callback from Sherlock's
router.post('/payment/callback', handlePaymentResponse)
router.get('/payment/callback', handlePaymentResponse)

// Handle normal return (user comes back from payment page)
router.get('/payment/return', handlePaymentResponse)
router.post('/payment/return', handlePaymentResponse) */

export default router
