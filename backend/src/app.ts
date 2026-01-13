import express from 'express'
import cors from 'cors'
import contactRoutes from './routes/contactRoutes'

const app = express()

// Middlewares globaux
app.use(
    cors({
        origin: true, // en prod, mettre le domaine précis du front
        credentials: false,
    }),
)
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
})

// Routes API
app.use('/api', contactRoutes)

// 404 API
app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Route API non trouvée.' })
})

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
)

export default app;