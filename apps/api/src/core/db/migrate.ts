import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FileMigrationProvider, Migrator } from 'kysely'
import { db } from './index'
import { logger } from '../logger'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, 'migrations'),
  }),
})

const { error, results } = await migrator.migrateToLatest()

results?.forEach((it) => {
  if (it.status === 'Success') logger.info(`migration applied: ${it.migrationName}`)
  else if (it.status === 'Error') logger.error(`migration failed: ${it.migrationName}`)
})

if (error) {
  logger.error({ error }, 'migration error')
  process.exit(1)
}

await db.destroy()
