import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // base path برای production (پنل ادمین روی /admin سرو می‌شود)
  base: '/admin/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://parvane-backend.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
