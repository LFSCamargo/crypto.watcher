const required = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback
  if (value === undefined) throw new Error(`Missing env var: ${key}`)
  return value
}

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required(
    'DATABASE_URL',
    'postgres://postgres:postgres@localhost:5432/crypto_watcher',
  ),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  rpcUrl: process.env.RPC_URL ?? 'http://localhost:8545',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(','),
} as const
