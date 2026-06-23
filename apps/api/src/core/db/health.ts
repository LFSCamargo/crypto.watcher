import { sql } from 'kysely'
import { db } from './index'

export async function checkDatabaseHealth(): Promise<void> {
  await sql`select 1 as ok`.execute(db)
}
