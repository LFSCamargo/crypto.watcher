import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('protocol_metrics_cache')
    .addColumn('slug', 'text', (c) => c.primaryKey())
    .addColumn('defillama_id', 'text', (c) => c.notNull())
    .addColumn('snapshot', 'jsonb', (c) => c.notNull())
    .addColumn('fetched_at', 'timestamptz', (c) => c.notNull())
    .addColumn('expires_at', 'timestamptz', (c) => c.notNull())
    .addColumn('updated_at', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createIndex('protocol_metrics_cache_expires_at_idx')
    .on('protocol_metrics_cache')
    .column('expires_at')
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('protocol_metrics_cache').execute()
}
