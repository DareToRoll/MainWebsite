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
}