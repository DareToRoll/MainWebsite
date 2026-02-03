import { Request, Response } from 'express'
import { sendContactNotificationEmail } from '../services/mailService'
import { sendTestEmail } from '../integrations/sendgridClient'

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
            topic: topic ? String(topic).trim() : 'general',
            message: String(message).trim(),
        }

        if (!payload.name || payload.name.length < 2) {
            return res.status(400).json({ error: 'Le nom doit contenir au moins 2 caractères.' })
        }

        if (!payload.email.includes('@') || payload.email.length < 3) {
            return res.status(400).json({ error: 'Adresse e-mail invalide.' })
        }

        if (payload.message.length < 10) {
            return res.status(400).json({ error: 'Le message doit contenir au moins 10 caractères.' })
        }

        if (payload.message.length > 5000) {
            return res.status(400).json({ error: 'Le message est trop long (maximum 5000 caractères).' })
        }

        await sendContactNotificationEmail(payload)

        return res.status(200).json({ success: true })
    } catch (error) {
        console.error('[Contact] Error:', error)
        return res.status(500).json({
            error: "Une erreur s'est produite lors de l'envoi du message.",
        })
    }
}

export async function testSendEmail(req: Request, res: Response) {
    try {
        const { to, from } = req.body || {}

        if (!to || !from) {
            return res.status(400).json({
                error: 'Les champs "to" et "from" sont obligatoires.',
            })
        }

        if (!to.includes('@') || !from.includes('@')) {
            return res.status(400).json({ 
                error: 'Les adresses e-mail doivent être valides.' 
            })
        }

        await sendTestEmail(to, from)
        
        console.log('Email sent successfully')
        return res.status(200).json({ 
            success: true,
            message: 'Email sent successfully' 
        })
    } catch (error) {
        console.error('Error sending test email:', error)
        return res.status(500).json({
            error: 'Erreur lors de l\'envoi de l\'email.',
            details: error instanceof Error ? error.message : String(error),
        })
    }
}