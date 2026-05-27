import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/fish': 'http://localhost:8000',
    },
  },
  build: {
    target: 'es2020',
    // Split router & UI into separate cacheable chunks
    rollupOptions: {
      output: {
        manualChunks: {
          router: ['react-router-dom'],
          ui: ['styled-components'],
        },
      },
    },
    // Increase inline asset limit so small icons stay inlined (saves requests)
    assetsInlineLimit: 4096,
    // Enable source map only in dev
    sourcemap: false,
    // Compress output
    minify: 'esbuild',
  },
})