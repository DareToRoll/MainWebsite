import { Request, Response } from 'express'
import { handleContactMessage } from '../services/mailService'

export async function postContact(req: Request, res: Response) {
    try {
        const { name, email, topic, message } = req.body || {}

        if (!name || !email || !message) {
            return res.status(400).json({
                error: 'Les champs nom, email et message sont obligatoires.',
            })
        }

        const payload = {
            name: String(name).trim(),
            email: String(email).trim(),
            topic: topic ? String(topic).trim() : 'Non précisé',
            message: String(message).trim(),
        }

        if (!payload.email.includes('@')) {
            return res.status(400).json({ error: 'Adresse e-mail invalide.' })
        }

        await handleContactMessage(payload)

        return res.status(200).json({ success: true })
    } catch (error) {
        console.error('Erreur postContact:', error)
        return res.status(500).json({
            error: "Une erreur s'est produite lors de l'envoi du message.",
        })
    }
}