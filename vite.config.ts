import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  // Origine de dev déterministe (PRD #49 mode B : front local → API distante).
  // L'API n'autorise en CORS que localhost:5173 — on fige le port pour l'éviter de glisser.
  server: { port: 5173, strictPort: true },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
