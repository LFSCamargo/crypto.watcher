import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('market_cache')
    .addColumn('slug', 'text', (c) => c.primaryKey())
    .addColumn('coingecko_id', 'text', (c) => c.notNull())
    .addColumn('snapshot', 'jsonb', (c) => c.notNull())
    .addColumn('fetched_at', 'timestamptz', (c) => c.notNull())
    .addColumn('expires_at', 'timestamptz', (c) => c.notNull())
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createIndex('market_cache_expires_at_idx')
    .on('market_cache')
    .column('expires_at')
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('market_cache').execute()
}
