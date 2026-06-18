import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`create extension if not exists "pgcrypto"`.execute(db)

  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('wallet_address', 'text', (c) => c.notNull().unique())
    .addColumn('display_name', 'text')
    .addColumn('avatar_url', 'text')
    .addColumn('bio', 'text')
    .addColumn('role', 'text', (c) => c.notNull().defaultTo('user'))
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz')
    .execute()

  await db.schema
    .createTable('projects')
    .addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('slug', 'text', (c) => c.notNull().unique())
    .addColumn('name', 'text', (c) => c.notNull())
    .addColumn('description', 'text')
    .addColumn('chain_id', 'integer', (c) => c.notNull())
    .addColumn('token_address', 'text')
    .addColumn('state', 'text', (c) => c.notNull().defaultTo('in_analysis'))
    .addColumn('voting_contract_address', 'text')
    .addColumn('submitted_by', 'uuid', (c) => c.references('users.id'))
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz')
    .execute()

  await db.schema
    .createIndex('projects_state_idx')
    .on('projects')
    .column('state')
    .execute()

  await db.schema
    .createTable('comments')
    .addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('project_id', 'uuid', (c) =>
      c.notNull().references('projects.id').onDelete('cascade'),
    )
    .addColumn('author_id', 'uuid', (c) => c.notNull().references('users.id'))
    .addColumn('body', 'text', (c) => c.notNull())
    .addColumn('deleted_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`))
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('comments').ifExists().execute()
  await db.schema.dropTable('projects').ifExists().execute()
  await db.schema.dropTable('users').ifExists().execute()
}
