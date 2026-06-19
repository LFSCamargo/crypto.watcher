/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Enable polling-based file watching when running inside Docker (HMR).
    watch: process.env.VITE_USE_POLLING === 'true' ? { usePolling: true } : undefined,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
