import { type Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('users')
    .addColumn('email_verified_at', 'timestamptz')
    .execute()

  await db.schema.alterTable('sessions').addColumn('otp_purpose', 'text').execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable('sessions').dropColumn('otp_purpose').execute()
  await db.schema.alterTable('users').dropColumn('email_verified_at').execute()
}
