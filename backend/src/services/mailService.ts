import sgMail from "@sendgrid/mail";
import { env } from "../config/env";

sgMail.setApiKey(env.SENDGRID_API_KEY);

type PaymentEmailData = {
    preheader?: string;
    brand?: { name?: string; website?: string; address?: string; logo_url?: string };
    customer?: { first_name?: string };
    order?: { id?: string; date?: string; url?: string };
    items?: Array<{ name?: string; description?: string; quantity?: number; price_formatted?: string }>;
    totals?: { 
        subtotal_formatted?: string;
        shipping_formatted?: string;
        donation_formatted?: string;
        tax_formatted?: string;
        total_formatted?: string;
    };
    payment?: { method?: string; last4?: string };
    support?: { email?: string; phone?: string };
};

export async function sendPaymentConfirmationEmail(to: string, data: PaymentEmailData) {
    await sgMail.send({
        to,
        from: env.SENDGRID_FROM_EMAIL,
        templateId: env.SENDGRID_PAYMENT_TEMPLATE_ID,
        dynamicTemplateData: data,
    });
}

type ContactEmailData = {
    name: string;
    email: string;
    topic: string;
    message: string;
};

export async function sendContactNotificationEmail(data: ContactEmailData) {
    const topicLabels: Record<string, string> = {
        general: 'Question générale',
        game: 'À propos d\'un jeu',
        event: 'Événement / soirée jeux',
        shop: 'Boutique / distribution',
        other: 'Autre',
    };

    await sgMail.send({
        to: env.SENDGRID_CONTACT_TO_EMAIL,
        from: env.SENDGRID_FROM_EMAIL,
        replyTo: data.email,
        templateId: env.SENDGRID_CONTACT_TEMPLATE_ID,
        dynamicTemplateData: {
            name: data.name,
            email: data.email,
            topic: topicLabels[data.topic] || data.topic,
            message: data.message,
            date: new Date().toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
        },
    });
}
