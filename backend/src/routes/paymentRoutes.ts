import { Router } from 'express';
import { initiatePayment, handleNormalReturn, handleAutomaticResponse } from '../controllers/paymentController';

const router = Router();

// POST /api/payment/init - Initialize payment and get Sherlock's redirection fields
router.post('/payment/init', initiatePayment);

// POST /api/payment/return - Handle normalReturnUrl callback (user-facing redirect)
router.post('/payment/return', handleNormalReturn);

// POST /api/payment/auto - Handle automaticResponseUrl callback (server-to-server)
router.post('/payment/auto', handleAutomaticResponse);

export default router;
