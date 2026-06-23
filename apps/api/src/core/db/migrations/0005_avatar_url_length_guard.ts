import { type Kysely, sql } from 'kysely'
import { MAX_AVATAR_URL_LENGTH } from '../../../shared/avatar-limits'

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    update users
    set avatar_url = null
    where avatar_url is not null and length(avatar_url) > ${MAX_AVATAR_URL_LENGTH}
  `.execute(db)

  await sql
    .raw(
      `alter table users add constraint users_avatar_url_length_chk check (avatar_url is null or length(avatar_url) <= ${MAX_AVATAR_URL_LENGTH})`,
    )
    .execute(db)
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`alter table users drop constraint if exists users_avatar_url_length_chk`.execute(db)
}
