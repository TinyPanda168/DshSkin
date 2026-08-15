import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  publicDir: fileURLToPath(new URL('../../skins', import.meta.url)),
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
