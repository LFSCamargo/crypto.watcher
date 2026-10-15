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
        'src/components/layout/**/*.{ts,tsx}',
        'src/components/ui/card.tsx',
        'src/modules/auth/components/**/*.tsx',
        'src/modules/auth/pages/**/*.tsx',
        'src/modules/auth/hooks/use-auth-links.ts',
        'src/modules/auth/hooks/use-resend-cooldown.ts',
        'src/modules/auth/lib/**/*.ts',
        'src/modules/projects/components/**/*.tsx',
        'src/modules/projects/pages/projects-page.tsx',
        'src/modules/projects/pages/project-detail-page.tsx',
        'src/modules/projects/pages/reference-project-detail-page.tsx',
        'src/modules/projects/hooks/use-catalog-filters.ts',
        'src/modules/scoring/components/score-panel.tsx',
        'src/components/ui/form-alert.tsx',
        'src/modules/analysis/components/**/*.tsx',
        'src/modules/analysis/pages/**/*.tsx',
        'src/modules/analysis/lib/**/*.ts',
        'src/modules/comments/components/**/*.tsx',
        'src/modules/market/components/**/*.tsx',
        'src/modules/marketing/components/**/*.tsx',
        'src/modules/marketing/pages/landing-page.tsx',
        'src/modules/docs/layouts/**/*.tsx',
        'src/modules/docs/components/docs-section.tsx',
        'src/modules/docs/components/docs-table.tsx',
        'src/modules/docs/lib/**/*.ts',
        'src/modules/blog/layouts/**/*.tsx',
        'src/modules/blog/pages/**/*.tsx',
        'src/modules/blog/components/blog-post-card.tsx',
      ],
      exclude: [
        '**/__tests__/**',
        'src/components/layout/page-grid-background.tsx',
        'src/modules/auth/components/authenticated-auth-controls.tsx',
        'src/modules/projects/components/project-search.tsx',
      ],
      thresholds: { statements: 80, branches: 70, functions: 80, lines: 80 },
    },
  },
})
