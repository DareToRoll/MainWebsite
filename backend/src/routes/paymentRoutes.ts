import { Router } from 'express';
import { initiatePayment, handleNormalReturn, handleAutomaticResponse, getPaymentResult } from '../controllers/paymentController';

const router = Router();

// POST /api/payment/init - Initialize payment and get Sherlock's redirection fields
router.post('/payment/init', initiatePayment);

// POST /api/payment/return - Handle normalReturnUrl callback (user-facing redirect)
router.post('/payment/return', (req, res, next) => {
    console.log('[Route] /payment/return - Route matched');
    console.log('[Route] Method:', req.method);
    console.log('[Route] Path:', req.path);
    console.log('[Route] Original URL:', req.originalUrl);
    next();
}, handleNormalReturn);

// POST /api/payment/auto - Handle automaticResponseUrl callback (server-to-server)
router.post('/payment/auto', handleAutomaticResponse);

// GET /api/payment/result - Get payment result from token (one-time read)
router.get('/payment/result', getPaymentResult);

export default router;
