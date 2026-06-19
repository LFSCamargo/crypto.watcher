import { db } from '../../core/db'

export const authRepository = {
  async createSession(input: { userId: string; nonce: string; expiresAt: Date }) {
    return db
      .insertInto('sessions')
      .values({
        user_id: input.userId,
        nonce: input.nonce,
        expires_at: input.expiresAt,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  async getActiveSessionByNonce(nonce: string) {
    return db
      .selectFrom('sessions')
      .innerJoin('users', 'users.id', 'sessions.user_id')
      .select([
        'sessions.id as session_id',
        'sessions.expires_at',
        'sessions.revoked_at',
        'users.id as user_id',
        'users.wallet_address',
        'users.display_name',
        'users.avatar_url',
        'users.bio',
        'users.role',
        'users.created_at',
      ])
      .where('sessions.nonce', '=', nonce)
      .where('sessions.revoked_at', 'is', null)
      .where('sessions.expires_at', '>', new Date())
      .executeTakeFirst()
  },

  async getActiveSessionById(sessionId: string) {
    return db
      .selectFrom('sessions')
      .innerJoin('users', 'users.id', 'sessions.user_id')
      .select([
        'sessions.id as session_id',
        'sessions.expires_at',
        'sessions.revoked_at',
        'users.id as user_id',
        'users.wallet_address',
        'users.display_name',
        'users.avatar_url',
        'users.bio',
        'users.role',
        'users.created_at',
      ])
      .where('sessions.id', '=', sessionId)
      .where('sessions.revoked_at', 'is', null)
      .where('sessions.expires_at', '>', new Date())
      .executeTakeFirst()
  },

  async revokeSession(sessionId: string) {
    await db
      .updateTable('sessions')
      .set({ revoked_at: new Date() })
      .where('id', '=', sessionId)
      .execute()
  },
}
