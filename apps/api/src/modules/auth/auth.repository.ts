import { db } from '../../core/db'
import type { OtpPurpose, SessionType } from '../../core/db/schema'

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
  'users.email_verified_at',
  'users.created_at',
  'users.updated_at',
] as const

export const authRepository = {
  async createSession(input: {
    userId: string
    sessionType?: SessionType
    nonce?: string | null
    otpPurpose?: OtpPurpose | null
    expiresAt: Date
  }) {
    return db
      .insertInto('sessions')
      .values({
        user_id: input.userId,
        session_type: input.sessionType ?? 'wallet',
        nonce: input.nonce ?? null,
        otp_purpose: input.otpPurpose ?? null,
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

  async revokeUserOtpTokens(userId: string, purpose: OtpPurpose) {
    await db
      .updateTable('sessions')
      .set({ revoked_at: new Date() })
      .where('user_id', '=', userId)
      .where('session_type', '=', 'otp')
      .where('otp_purpose', '=', purpose)
      .where('revoked_at', 'is', null)
      .execute()
  },

  async getActiveOtpForEmail(email: string, code: string, purpose: OtpPurpose) {
    return db
      .selectFrom('sessions')
      .innerJoin('users', 'users.id', 'sessions.user_id')
      .select([
        'sessions.id',
        'sessions.user_id',
        'sessions.expires_at',
        'sessions.otp_purpose',
      ])
      .where('users.email', '=', email.toLowerCase())
      .where('sessions.nonce', '=', code)
      .where('sessions.session_type', '=', 'otp')
      .where('sessions.otp_purpose', '=', purpose)
      .where('sessions.revoked_at', 'is', null)
      .where('sessions.expires_at', '>', new Date())
      .executeTakeFirst()
  },

  async getActiveAuthOtpForEmail(email: string, code: string) {
    return db
      .selectFrom('sessions')
      .innerJoin('users', 'users.id', 'sessions.user_id')
      .select([
        'sessions.id',
        'sessions.user_id',
        'sessions.expires_at',
        'sessions.otp_purpose',
      ])
      .where('users.email', '=', email.toLowerCase())
      .where('sessions.nonce', '=', code)
      .where('sessions.session_type', '=', 'otp')
      .where('sessions.otp_purpose', 'in', ['verify_email', 'sign_in'])
      .where('sessions.revoked_at', 'is', null)
      .where('sessions.expires_at', '>', new Date())
      .executeTakeFirst()
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
