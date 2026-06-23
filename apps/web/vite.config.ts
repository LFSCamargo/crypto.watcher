/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import type { ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const API_TARGET = 'http://localhost:3000'

// Load VITE_* vars from the central env file at the monorepo root.
const repoRoot = fileURLToPath(new URL('../../', import.meta.url))

/** Proxy API calls but serve the SPA for browser navigations on overlapping paths. */
function apiProxy(): ProxyOptions {
  return {
    target: API_TARGET,
    bypass(req) {
      const accept = req.headers.accept ?? ''
      if (accept.includes('text/html')) {
        return '/index.html'
      }
      return undefined
    },
  }
}

export default defineConfig({
  plugins: [react()],
  publicDir: 'src/public',
  envDir: repoRoot,
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    modulePreload: {
      resolveDependencies: (_url, deps) =>
        deps.filter((dep) => !dep.includes('/web3-') && !dep.includes('/metamask-sdk-')),
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            /node_modules\/react-router-dom\//.test(id) ||
            /node_modules\/react-router\//.test(id) ||
            /node_modules\/react-dom\//.test(id) ||
            /node_modules\/react-helmet-async\//.test(id) ||
            /node_modules\/scheduler\//.test(id) ||
            /node_modules\/react\//.test(id)
          ) {
            return 'vendor-react'
          }

          if (
            id.includes('@rainbow-me/rainbowkit') ||
            id.includes('/wagmi/') ||
            id.includes('/viem/')
          ) {
            return 'web3'
          }

          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('@tanstack/react-query')) return 'query'
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/market': apiProxy(),
      '/auth': apiProxy(),
      '/projects': apiProxy(),
      '/protocol-metrics': apiProxy(),
      '/analysis-requests': apiProxy(),
      '/users': apiProxy(),
      '/reputation': apiProxy(),
      '/governance': apiProxy(),
    },
    // Enable polling-based file watching when running inside Docker (HMR).
    watch: process.env.VITE_USE_POLLING === 'true' ? { usePolling: true } : undefined,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/__tests__/**/*.test.tsx', 'src/__tests__/**/*.test.tsx'],
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
