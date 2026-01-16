import dotenv from 'dotenv'

dotenv.config()

const required = (value: string | undefined, name: string): string => {
    if (!value) {
        throw new Error(`Missing required env var: ${name}`)
    }
    return value
}

export const env = {
    PORT: Number(process.env.PORT || 4000),
    SENDGRID_API_KEY: required(process.env.SENDGRID_API_KEY, 'SENDGRID_API_KEY'),
    CONTACT_FROM: required(process.env.CONTACT_FROM, 'CONTACT_FROM'),
    CONTACT_TO: required(process.env.CONTACT_TO, 'CONTACT_TO'),
    CONTACT_TEMPLATE_ID: required(
        process.env.CONTACT_TEMPLATE_ID,
        'CONTACT_TEMPLATE_ID',
    ),
    // Sherlock's Sips Paypage configuration
    SHERLOCK_MERCHANT_ID: required(
        process.env.SHERLOCK_MERCHANT_ID,
        'SHERLOCK_MERCHANT_ID',
    ),
    SHERLOCK_SECRET_KEY: required(
        process.env.SHERLOCK_SECRET_KEY,
        'SHERLOCK_SECRET_KEY',
    ),
    SHERLOCK_KEY_VERSION: required(
        process.env.SHERLOCK_KEY_VERSION,
        'SHERLOCK_KEY_VERSION',
    ),
    SHERLOCK_PAYMENT_URL:
        process.env.SHERLOCK_PAYMENT_URL ||
        'https://sherlocks-paiement.secure.lcl.fr/payment',
    SHERLOCK_RETURN_URL: required(
        process.env.SHERLOCK_RETURN_URL,
        'SHERLOCK_RETURN_URL',
    ),
    SHERLOCK_CALLBACK_URL: required(
        process.env.SHERLOCK_CALLBACK_URL,
        'SHERLOCK_CALLBACK_URL',
    ),
}