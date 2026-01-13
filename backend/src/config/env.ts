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
}