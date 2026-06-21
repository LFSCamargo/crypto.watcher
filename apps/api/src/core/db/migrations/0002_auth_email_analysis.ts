import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('users')
    .alterColumn('wallet_address', (c) => c.dropNotNull())
    .addColumn('email', 'text')
    .addColumn('password_hash', 'text')
    .addColumn('public_key', 'text')
    .addColumn('x_account', 'text')
    .addColumn('nickname', 'text')
    .execute()

  await db.schema
    .createIndex('users_email_unique_idx')
    .on('users')
    .column('email')
    .unique()
    .execute()

  await db.schema
    .createIndex('users_nickname_unique_idx')
    .on('users')
    .column('nickname')
    .unique()
    .execute()

  await db.schema
    .alterTable('sessions')
    .addColumn('session_type', 'text', (c) => c.notNull().defaultTo('wallet'))
    .alterColumn('nonce', (c) => c.dropNotNull())
    .execute()

  await db.schema
    .alterTable('comments')
    .addColumn('comment_fee_paid', 'boolean', (c) => c.notNull().defaultTo(true))
    .execute()

  await db.schema
    .createTable('analysis_requests')
    .addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (c) =>
      c.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('project_name', 'text', (c) => c.notNull())
    .addColumn('project_url', 'text', (c) => c.notNull())
    .addColumn('description', 'text', (c) => c.notNull())
    .addColumn('status', 'text', (c) => c.notNull().defaultTo('pending'))
    .addColumn('payment_tx_hash', 'text')
    .addColumn('fee_amount', 'numeric', (c) => c.notNull())
    .addColumn('review_notes', 'text')
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz')
    .execute()

  await db.schema
    .createIndex('analysis_requests_status_idx')
    .on('analysis_requests')
    .column('status')
    .execute()

  await db.schema
    .createIndex('analysis_requests_user_id_idx')
    .on('analysis_requests')
    .column('user_id')
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('analysis_requests').ifExists().execute()

  await db.schema
    .alterTable('comments')
    .dropColumn('comment_fee_paid')
    .execute()

  await db.schema
    .alterTable('sessions')
    .dropColumn('session_type')
    .alterColumn('nonce', (c) => c.setNotNull())
    .execute()

  await db.schema.dropIndex('users_nickname_unique_idx').ifExists().execute()
  await db.schema.dropIndex('users_email_unique_idx').ifExists().execute()

  await db.schema
    .alterTable('users')
    .dropColumn('nickname')
    .dropColumn('x_account')
    .dropColumn('public_key')
    .dropColumn('password_hash')
    .dropColumn('email')
    .alterColumn('wallet_address', (c) => c.setNotNull())
    .execute()
}
