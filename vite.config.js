import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Khi chạy dev (npm run dev): chuyển /api/* sang server NestJS ở cổng 3000
    // Server đã có setGlobalPrefix('api') nên giữ nguyên tiền tố /api
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
