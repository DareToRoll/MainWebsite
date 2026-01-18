import sgMail from '@sendgrid/mail'
import { env } from '../config/env'

/* sgMail.setApiKey(env.SENDGRID_API_KEY) */

export interface ContactPayload {
    name: string
    email: string
    topic: string
    message: string
}

/* export async function sendContactMail(data: ContactPayload): Promise<void> {
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
} */