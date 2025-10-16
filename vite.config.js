import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: set base for GitHub Pages (repo name)
  base: process.env.NODE_ENV === 'production' ? '/walletcard/' : '/',
})
