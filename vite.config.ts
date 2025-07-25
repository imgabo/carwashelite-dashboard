import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  preview: {
    port: (process.env.PORT ? parseInt(process.env.PORT) : 4173),
    host: '0.0.0.0',
    allowedHosts: [
      'healthcheck.railway.app',
      'multiserviciosym.cl',
      'www.multiserviciosym.cl',
      'carwashelite-dashboard-production.up.railway.app'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
