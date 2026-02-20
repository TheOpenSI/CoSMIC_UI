import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For production, we serve static files from FastAPI; no proxy needed.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // will be copied into the Python image
    sourcemap: false
  }
})