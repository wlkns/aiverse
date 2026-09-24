import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

export default defineConfig({
  // cloudflare() runs worker/index.ts alongside the app in dev and preview.
  plugins: [vue(), tailwindcss(), cloudflare()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 4217,
    strictPort: true,
  },
})
