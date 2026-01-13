import { Router } from 'express'
import { postContact } from '../controllers/contactController'

const router = Router()

router.post('/contact', postContact)

export default router;