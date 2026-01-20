import express from 'express'
import cors from 'cors'
import { env } from "./config/env";

import contactRoutes from './routes/contactRoutes'
import paymentRoutes from './routes/paymentRoutes'

const app = express();

const allowed = env.FRONTEND_ORIGINS.split(",").map(s => s.trim());

// Middlewares globaux
app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // non-browser calls (some webhooks) may not send Origin
      return allowed.includes(origin)
        ? cb(null, true)
        : cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
});

// Routes API
app.use('/api', contactRoutes);
app.use('/api', paymentRoutes);

// 404 API
app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Route API non trouvée.' })
});

// Middleware global d'erreur (si tu fais next(err))
app.use(
    (
        err: unknown,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
    ) => {
        console.error('Unhandled error:', err)
        res.status(500).json({ error: 'Erreur serveur interne.' })
    },
);

export default app;