import { Router } from 'express'
//import { postContact } from '../controllers/contactController'
import { testSendEmail } from '../controllers/contactController'

const router = Router()

//router.post('/contact', postContact)
router.post('/contact/test', testSendEmail)

export default router;