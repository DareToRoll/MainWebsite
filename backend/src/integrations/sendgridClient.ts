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

/* 
// Uncomment when CONTACT_TO, CONTACT_FROM, and CONTACT_TEMPLATE_ID are added to env.ts
export async function sendContactMail(data: ContactPayload): Promise<void> {
    const msg = {
        to: env.CONTACT_TO,
        from: env.CONTACT_FROM,
        templateId: env.CONTACT_TEMPLATE_ID,
        dynamic_template_data: {
            name: data.name,
            email: data.email,
            topic: data.topic,
            message: data.message,
        },
    }
    
    await sgMail.send(msg)
}
*/

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