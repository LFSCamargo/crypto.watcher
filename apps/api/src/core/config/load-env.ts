import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { config as loadDotenv } from 'dotenv'

/** Walk up from `start` to the monorepo root (marked by pnpm-workspace.yaml). */
const findRepoRoot = (start: string): string => {
  let dir = start
  for (;;) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = dirname(dir)
    if (parent === dir) return start
    dir = parent
  }
}

let loaded = false

/**
 * Load the central monorepo env files into `process.env`.
 *
 * Reads `<root>/.env.local` then `<root>/.env`. dotenv never overrides variables
 * that are already set, so real process env (Docker/CI) and `.env.local` win over
 * the shared `.env`. Safe to call multiple times.
 */
export const loadEnv = (): void => {
  if (loaded) return
  loaded = true
  const root = findRepoRoot(process.cwd())
  for (const file of ['.env.local', '.env']) {
    const path = resolve(root, file)
    if (existsSync(path)) loadDotenv({ path })
  }
}
