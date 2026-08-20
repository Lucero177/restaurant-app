import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Si se usa el backend Python (Flask) para persistencia real
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
