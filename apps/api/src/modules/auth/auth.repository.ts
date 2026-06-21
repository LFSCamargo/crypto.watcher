import { db } from '../../core/db'
import type { SessionType } from '../../core/db/schema'

const userSessionSelect = [
  'sessions.id as session_id',
  'sessions.expires_at',
  'sessions.revoked_at',
  'users.id as user_id',
  'users.wallet_address',
  'users.email',
  'users.public_key',
  'users.x_account',
  'users.nickname',
  'users.display_name',
  'users.avatar_url',
  'users.bio',
  'users.role',
  'users.created_at',
  'users.updated_at',
] as const

export const authRepository = {
  async createSession(input: {
    userId: string
    sessionType?: SessionType
    nonce?: string | null
    expiresAt: Date
  }) {
    return db
      .insertInto('sessions')
      .values({
        user_id: input.userId,
        session_type: input.sessionType ?? 'wallet',
        nonce: input.nonce ?? null,
        expires_at: input.expiresAt,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  async getActiveSessionByNonce(nonce: string) {
    return db
      .selectFrom('sessions')
      .innerJoin('users', 'users.id', 'sessions.user_id')
      .select(userSessionSelect)
      .where('sessions.nonce', '=', nonce)
      .where('sessions.session_type', '=', 'wallet')
      .where('sessions.revoked_at', 'is', null)
      .where('sessions.expires_at', '>', new Date())
      .executeTakeFirst()
  },

  async getActiveResetByToken(token: string) {
    return db
      .selectFrom('sessions')
      .select(['id', 'user_id', 'expires_at'])
      .where('nonce', '=', token)
      .where('session_type', '=', 'reset')
      .where('revoked_at', 'is', null)
      .where('expires_at', '>', new Date())
      .executeTakeFirst()
  },

  async revokeUserResetTokens(userId: string) {
    await db
      .updateTable('sessions')
      .set({ revoked_at: new Date() })
      .where('user_id', '=', userId)
      .where('session_type', '=', 'reset')
      .where('revoked_at', 'is', null)
      .execute()
  },

  async getActiveSessionById(sessionId: string) {
    return db
      .selectFrom('sessions')
      .innerJoin('users', 'users.id', 'sessions.user_id')
      .select(userSessionSelect)
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
