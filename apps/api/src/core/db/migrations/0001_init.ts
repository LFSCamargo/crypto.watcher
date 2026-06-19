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
    .createTable('sessions')
    .addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (c) =>
      c.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('nonce', 'text', (c) => c.notNull())
    .addColumn('expires_at', 'timestamptz', (c) => c.notNull())
    .addColumn('revoked_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`))
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
    .createIndex('projects_chain_id_idx')
    .on('projects')
    .column('chain_id')
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

  await db.schema
    .createIndex('comments_project_created_idx')
    .on('comments')
    .columns(['project_id', 'created_at'])
    .execute()

  await db.schema
    .createTable('votes')
    .addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('project_id', 'uuid', (c) => c.notNull().references('projects.id'))
    .addColumn('round', 'integer', (c) => c.notNull().defaultTo(1))
    .addColumn('voter_address', 'text', (c) => c.notNull())
    .addColumn('choice', 'smallint', (c) => c.notNull())
    .addColumn('weight', 'numeric', (c) => c.notNull())
    .addColumn('tx_hash', 'text', (c) => c.notNull().unique())
    .addColumn('block_number', 'bigint', (c) => c.notNull())
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint('votes_project_voter_round_unique', [
      'project_id',
      'voter_address',
      'round',
    ])
    .execute()

  await db.schema
    .createIndex('votes_project_idx')
    .on('votes')
    .column('project_id')
    .execute()

  await db.schema
    .createTable('scores')
    .addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('project_id', 'uuid', (c) => c.notNull().references('projects.id'))
    .addColumn('round', 'integer', (c) => c.notNull())
    .addColumn('value', 'numeric', (c) => c.notNull())
    .addColumn('breakdown', 'jsonb', (c) => c.notNull())
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint('scores_project_round_unique', ['project_id', 'round'])
    .execute()

  await db.schema
    .createTable('reputation')
    .addColumn('wallet_address', 'text', (c) => c.primaryKey())
    .addColumn('eligible', 'boolean', (c) => c.notNull().defaultTo(false))
    .addColumn('weight', 'numeric', (c) => c.notNull().defaultTo(0))
    .addColumn('factors', 'jsonb')
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz')
    .execute()

  await db.schema
    .createTable('governance_proposals')
    .addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('onchain_id', 'text', (c) => c.notNull().unique())
    .addColumn('proposer_address', 'text', (c) => c.notNull())
    .addColumn('title', 'text', (c) => c.notNull())
    .addColumn('description', 'text')
    .addColumn('state', 'text', (c) => c.notNull())
    .addColumn('start_block', 'bigint')
    .addColumn('end_block', 'bigint')
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz')
    .execute()

  await db.schema
    .createTable('chain_events')
    .addColumn('id', 'uuid', (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('chain_id', 'integer', (c) => c.notNull())
    .addColumn('contract_address', 'text', (c) => c.notNull())
    .addColumn('event_name', 'text', (c) => c.notNull())
    .addColumn('tx_hash', 'text', (c) => c.notNull())
    .addColumn('log_index', 'integer', (c) => c.notNull())
    .addColumn('block_number', 'bigint', (c) => c.notNull())
    .addColumn('payload', 'jsonb', (c) => c.notNull())
    .addColumn('created_at', 'timestamptz', (c) => c.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint('chain_events_tx_log_unique', ['tx_hash', 'log_index'])
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('chain_events').ifExists().execute()
  await db.schema.dropTable('governance_proposals').ifExists().execute()
  await db.schema.dropTable('reputation').ifExists().execute()
  await db.schema.dropTable('scores').ifExists().execute()
  await db.schema.dropTable('votes').ifExists().execute()
  await db.schema.dropTable('comments').ifExists().execute()
  await db.schema.dropTable('projects').ifExists().execute()
  await db.schema.dropTable('sessions').ifExists().execute()
  await db.schema.dropTable('users').ifExists().execute()
}
