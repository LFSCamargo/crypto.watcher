import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/__tests__/**',
        'src/main.ts',
        'src/core/db/migrate.ts',
        'src/core/db/migrations/**',
        'src/**/*.repository.ts',
        'src/core/chain/**',
      ],
      thresholds: { statements: 80, branches: 70, functions: 80, lines: 80 },
    },
  },
})
