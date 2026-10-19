import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://<user>.github.io/pink_apl/
  base: '/pink_apl/',
  plugins: [react(), tailwindcss()],
})
