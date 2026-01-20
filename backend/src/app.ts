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
      // Allow requests without origin (webhooks, server-to-server calls)
      if (!origin) return cb(null, true);
      
      // Allow Sherlock's/SIPS payment callbacks
      // These are server-to-server webhooks, not browser requests
      const sherlockDomains = [
        'https://sherlocks-payment-web-simu.secure.lcl.fr',
        'https://payment-webinit.sips-services.com',
        'https://payment-webinit.test.sips-services.com',
        'https://sherlocks-payment-web.secure.lcl.fr',
      ];
      
      if (sherlockDomains.some(domain => origin.startsWith(domain))) {
        return cb(null, true);
      }
      
      // Allow frontend origins
      return allowed.includes(origin)
        ? cb(null, true)
        : cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware for debugging
app.use((req, res, next) => {
    if (req.path.startsWith('/api/payment/return') || req.path.startsWith('/api/payment/auto')) {
        console.log('[Middleware] Incoming request:', req.method, req.path);
        console.log('[Middleware] Content-Type:', req.get('Content-Type'));
        console.log('[Middleware] Body keys:', Object.keys(req.body || {}));
    }
    next();
});

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