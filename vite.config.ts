import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

const webSrc = resolve(__dirname, 'web-src')

export default defineConfig({
  root: webSrc,
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'pinia', 'vue-router'],
      dts: resolve(webSrc, 'auto-imports.d.ts'),
      dirs: [resolve(webSrc, 'stores'), resolve(webSrc, 'utils')],
      vueTemplate: true,
    }),
  ],
  resolve: {
    alias: {
      '@': webSrc,
    },
  },
  // Relative assets so wujie can load under /vome/apps/{key}/
  base: './',
  build: {
    outDir: resolve(__dirname, 'web'),
    emptyOutDir: true,
  },
})
