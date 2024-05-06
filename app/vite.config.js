import dns from 'node:dns'

import dotenv from 'dotenv'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

dotenv.config()

dns.setDefaultResultOrder('verbatim')

// Map necessary neon's env vars as Vite only expose VITE_*
process.env.VITE_neon_NODE_ENV = process.env.neon_NODE_ENV
process.env.VITE_neon_HOST = process.env.neon_HOST
process.env.VITE_neon_PORT = process.env.neon_PORT

export default defineConfig({
  root: 'app/src',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 3000
  },
  plugins: [react()]
})
