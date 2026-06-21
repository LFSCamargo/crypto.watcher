/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  publicDir: 'src/public',
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/market': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
      '/projects': 'http://localhost:3000',
      '/analysis-requests': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/reputation': 'http://localhost:3000',
      '/governance': 'http://localhost:3000',
    },
    // Enable polling-based file watching when running inside Docker (HMR).
    watch: process.env.VITE_USE_POLLING === 'true' ? { usePolling: true } : undefined,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
