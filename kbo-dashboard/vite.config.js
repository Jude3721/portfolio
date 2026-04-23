import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/portfolio/kbo-dashboard/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: false,
      },
      '/kbo-api': {
        target: 'https://www.koreabaseball.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kbo-api/, ''),
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Referer', 'https://www.koreabaseball.com/Schedule/Schedule.aspx')
            proxyReq.setHeader('Origin', 'https://www.koreabaseball.com')
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36')
            // koreabaseball.com 접속 후 F12 → Application → Cookies에서 ASP.NET_SessionId 값을 붙여넣으세요
            // proxyReq.setHeader('Cookie', 'ASP.NET_SessionId=여기에_값_붙여넣기')
          })
        },
      },
    },
  },
})
