import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Конфигурация Vite для сборки и деплоя на GitHub Pages
// При деплое проект будет доступен по адресу: https://KiNDeR88.github.io/walletcard/
// поэтому base должен указывать на "/walletcard/"

export default defineConfig({
  plugins: [react()],

  // Указываем базовый путь для корректной работы ресурсов при деплое
  base: process.env.NODE_ENV === 'production' ? '/walletcard/' : '/',

  // Дополнительные настройки сервера (для локальной разработки)
  server: {
    port: 5173,
    open: true
  },

  // Включаем sourcemap для отладки продакшн-сборки
  build: {
    sourcemap: true
  }
})
