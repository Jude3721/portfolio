import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/portfolio/nba-dashboard/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: false,
      },
    },
  },
})
