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
    include: ['src/**/__tests__/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: [
        'src/components/brand/project-icon.tsx',
        'src/modules/auth/components/password-strength-field.tsx',
        'src/modules/projects/components/**/*.tsx',
        'src/modules/market/components/**/*.tsx',
      ],
      exclude: [
        '**/__tests__/**',
        'src/modules/projects/components/project-search.tsx',
        'src/modules/projects/components/reference-project-voting-cta.tsx',
      ],
      thresholds: { statements: 80, branches: 70, functions: 80, lines: 80 },
    },
  },
})
