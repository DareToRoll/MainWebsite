import sgMail from '@sendgrid/mail'
import { env } from '../config/env'

// Set API key
if (env.SENDGRID_API_KEY) {
    sgMail.setApiKey(env.SENDGRID_API_KEY)
} else {
    console.warn('SENDGRID_API_KEY is not set. SendGrid functionality will not work.')
}

export interface ContactPayload {
    name: string
    email: string
    topic: string
    message: string
}

// Simple test function for sending email
export async function sendTestEmail(to: string, from: string): Promise<void> {
    const msg = {
        to,
        from,
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }
    
    await sgMail.send(msg)
}