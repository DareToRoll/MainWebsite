import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Environment variables with VITE_ prefix are exposed to the client
  // VITE_API_BASE_URL should be set in .env.local for development
  // and in Netlify environment variables for production
})
