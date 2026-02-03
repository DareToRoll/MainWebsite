import dotenv from 'dotenv';

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

function required(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`Missing environment variable: ${name}`);
    return v;
}

export const env = {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: Number(process.env.PORT || 3000),

    FRONTEND_ORIGINS: process.env.FRONTEND_ORIGINS ?? "http://localhost:5173",
    FRONTEND_BASE_URL: required("FRONTEND_BASE_URL"),

    // Sherlock's / SIPS Paypage config
    SHERLOCK_PAYMENT_INIT_URL: required("SHERLOCK_PAYMENT_INIT_URL"),
    SHERLOCK_SECRET_KEY: required("SHERLOCK_SECRET_KEY"),
    SHERLOCK_MERCHANT_ID: required("SHERLOCK_MERCHANT_ID"),
    SHERLOCK_KEY_VERSION: required("SHERLOCK_KEY_VERSION"),
    SHERLOCK_INTERFACE_VERSION: process.env.SHERLOCK_INTERFACE_VERSION ?? "IR_WS_3.4",
    SHERLOCK_SEAL_ALGORITHM: (process.env.SHERLOCK_SEAL_ALGORITHM ?? "HMAC-SHA-256") as "HMAC-SHA-256" | "SHA-256",
    SIPS_TRANSACTION_KEY_MODE: (process.env.SIPS_TRANSACTION_KEY_MODE ?? "auto") as "auto" | "merchant",

    // SendGrid config
    SENDGRID_API_KEY: required("SENDGRID_API_KEY"),
    SENDGRID_FROM_EMAIL: required("SENDGRID_FROM_EMAIL"),
    SENDGRID_PAYMENT_TEMPLATE_ID: required("SENDGRID_PAYMENT_TEMPLATE_ID"),
    SENDGRID_CONTACT_TEMPLATE_ID: required("SENDGRID_CONTACT_TEMPLATE_ID"),
    SENDGRID_CONTACT_TO_EMAIL: required("SENDGRID_CONTACT_TO_EMAIL"),
}