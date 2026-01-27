import sgMail from "@sendgrid/mail";
import { env } from "../config/env";

sgMail.setApiKey(env.SENDGRID_API_KEY);

type PaymentEmailData = {
    preheader?: string;
    brand?: { name?: string; website?: string; address?: string; logo_url?: string };
    customer?: { first_name?: string };
    order?: { id?: string; date?: string; url?: string };
    items?: Array<{ name?: string; description?: string; quantity?: number; price_formatted?: string }>;
    totals?: { subtotal_formatted?: string; shipping_formatted?: string; tax_formatted?: string; total_formatted?: string };
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
