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
  webUrl: process.env.WEB_URL ?? 'http://localhost:5173',
  smtp: {
    host: process.env.SMTP_HOST ?? 'localhost',
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM ?? 'Crypto Watcher <noreply@localhost>',
  },
} as const
