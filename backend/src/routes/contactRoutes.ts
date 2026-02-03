import { Router } from 'express'
import { postContact, testSendEmail } from '../controllers/contactController'

const router = Router()

router.post('/contact', postContact)
router.post('/contact/test', testSendEmail)

export default router;