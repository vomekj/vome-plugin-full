import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  root: resolve(__dirname, 'web-src'),
  plugins: [vue()],
  // Relative assets so wujie can load under /vome/apps/{key}/
  base: './',
  build: {
    outDir: resolve(__dirname, 'web'),
    emptyOutDir: true,
  },
})
