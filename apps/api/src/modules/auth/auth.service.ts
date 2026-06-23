import { randomBytes, randomInt } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { isAddress, verifyMessage } from 'viem'
import { config } from '../../core/config'
import { mailService } from '../../core/mail/mail.service'
import { normalizeAddress } from '../../shared/address'
import { mapUser, usersService } from '../users/users.service'
import { authRepository } from './auth.repository'

const SESSION_COOKIE = 'cw_session'
const BCRYPT_ROUNDS = 10
const WALLET_NONCE_TTL_MS = 10 * 60 * 1000
const EMAIL_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000
const OTP_TTL_MS = 10 * 60 * 1000
const RESET_EMAIL_EXPIRES_MINUTES = 30
const OTP_EMAIL_EXPIRES_MINUTES = 10

export const sessionCookieName = SESSION_COOKIE

export const generateOtpCode = () => randomInt(100_000, 1_000_000).toString()

export const buildSignInMessage = (address: string, nonce: string): string =>
  [
    'Crypto Watcher wants you to sign in with your wallet.',
    '',
    `Address: ${normalizeAddress(address)}`,
    `Nonce: ${nonce}`,
  ].join('\n')

export const extractNonce = (message: string): string | undefined =>
  message.match(/^Nonce: (?<nonce>[a-f0-9]+)$/m)?.groups?.nonce

const sessionUserFromRow = (session: {
  user_id: string
  wallet_address: string | null
  email: string | null
  public_key: string | null
  x_account: string | null
  nickname: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: 'user' | 'team' | 'admin'
  email_verified_at: Date | null
  created_at: Date
  updated_at: Date | null
}) =>
  mapUser({
    id: session.user_id,
    wallet_address: session.wallet_address,
    email: session.email,
    public_key: session.public_key,
    x_account: session.x_account,
    nickname: session.nickname,
    display_name: session.display_name,
    avatar_url: session.avatar_url,
    bio: session.bio,
    role: session.role,
    email_verified_at: session.email_verified_at,
    created_at: session.created_at,
    updated_at: session.updated_at,
  })

const issueOtpForUser = async (
  userId: string,
  email: string,
  purpose: 'verify_email' | 'sign_in' | 'password_reset',
) => {
  await authRepository.revokeUserOtpTokens(userId, purpose)
  const code = generateOtpCode()
  await authRepository.createSession({
    userId,
    sessionType: 'otp',
    nonce: code,
    otpPurpose: purpose,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  })

  await mailService.sendOtpEmail({
    to: email,
    code,
    purpose,
    expiresMinutes: OTP_EMAIL_EXPIRES_MINUTES,
  })

  return code
}

export const authService = {
  async createNonce(address: string) {
    const user = await usersService.upsertByAddress(address)
    const nonce = randomBytes(16).toString('hex')
    await authRepository.createSession({
      userId: user.id,
      sessionType: 'wallet',
      nonce,
      expiresAt: new Date(Date.now() + WALLET_NONCE_TTL_MS),
    })

    return { nonce, message: buildSignInMessage(address, nonce) }
  },

  async verify(input: { address: string; message: string; signature: string }) {
    const nonce = extractNonce(input.message)
    if (!nonce) return undefined

    const session = await authRepository.getActiveSessionByNonce(nonce)
    if (!session) return undefined
    if (!session.wallet_address) return undefined
    if (session.wallet_address !== normalizeAddress(input.address)) return undefined

    const valid = await verifyMessage({
      address: input.address as `0x${string}`,
      message: input.message,
      signature: input.signature as `0x${string}`,
    })
    if (!valid) return undefined

    return {
      sessionId: session.session_id,
      user: sessionUserFromRow(session),
    }
  },

  async register(input: { email: string; password: string; nickname?: string }) {
    const existingEmail = await usersService.getByEmail(input.email)
    if (existingEmail) throw new Error('EMAIL_TAKEN')

    if (input.nickname) {
      const existingNickname = await usersService.getByNickname(input.nickname)
      if (existingNickname) throw new Error('NICKNAME_TAKEN')
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
    const user = await usersService.createWithEmail({
      email: input.email.toLowerCase(),
      passwordHash,
      nickname: input.nickname ?? null,
    })

    await issueOtpForUser(user.id, user.email!, 'verify_email').catch(() => undefined)

    return { ok: true as const, email: user.email! }
  },

  async login(input: { email: string; password: string }) {
    const userRow = await usersService.getRowByEmail(input.email.toLowerCase())
    if (!userRow?.password_hash || !userRow.email) return undefined

    const valid = await bcrypt.compare(input.password, userRow.password_hash)
    if (!valid) return undefined

    await issueOtpForUser(userRow.id, userRow.email, 'sign_in')

    return { ok: true as const, email: userRow.email }
  },

  async linkPublicKey(userId: string, publicKey: string) {
    if (!isAddress(publicKey)) throw new Error('INVALID_PUBLIC_KEY')

    const walletAddress = normalizeAddress(publicKey)
    const existing = await usersService.getByAddress(walletAddress)
    if (existing && existing.id !== userId) throw new Error('WALLET_TAKEN')

    const user = await usersService.linkPublicKey(userId, walletAddress)
    if (!user) throw new Error('USER_NOT_FOUND')
    return user
  },

  async requestPasswordReset(email: string) {
    const userRow = await usersService.getRowByEmail(email.toLowerCase())
    // Always succeed to avoid leaking which emails are registered.
    if (!userRow?.password_hash) return { ok: true as const, token: undefined }

    await authRepository.revokeUserResetTokens(userRow.id)
    const token = randomBytes(24).toString('hex')
    await authRepository.createSession({
      userId: userRow.id,
      sessionType: 'reset',
      nonce: token,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    })

    const resetUrl = `${config.webUrl}/auth/reset-password?token=${token}`
    await mailService.sendPasswordResetEmail({
      to: userRow.email!,
      resetUrl,
      expiresMinutes: RESET_EMAIL_EXPIRES_MINUTES,
    })

    const token_ = config.env === 'production' ? undefined : token
    return { ok: true as const, token: token_ }
  },

  async resetPassword(input: { token: string; password: string }) {
    const reset = await authRepository.getActiveResetByToken(input.token)
    if (!reset) return undefined

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
    await usersService.updatePassword(reset.user_id, passwordHash)
    await authRepository.revokeUserResetTokens(reset.user_id)
    return { ok: true as const }
  },

  async getSession(sessionId: string) {
    const session = await authRepository.getActiveSessionById(sessionId)
    if (!session) return undefined
    return {
      sessionId: session.session_id,
      user: sessionUserFromRow(session),
    }
  },

  revokeSession: authRepository.revokeSession,

  async sendEmailVerificationOtp(email: string) {
    const userRow = await usersService.getRowByEmail(email.toLowerCase())
    if (!userRow?.email) return { ok: true as const }

    const purpose = userRow.email_verified_at ? 'sign_in' : 'verify_email'
    const code = await issueOtpForUser(userRow.id, userRow.email, purpose)
    const code_ = config.env === 'production' ? undefined : code
    return { ok: true as const, code: code_ }
  },

  async verifyEmailOtp(input: { email: string; code: string }) {
    const otp = await authRepository.getActiveAuthOtpForEmail(
      input.email.toLowerCase(),
      input.code,
    )
    if (!otp?.otp_purpose) return undefined

    const user =
      otp.otp_purpose === 'verify_email'
        ? await usersService.markEmailVerified(otp.user_id)
        : await usersService.getById(otp.user_id)
    if (!user) return undefined

    await authRepository.revokeUserOtpTokens(otp.user_id, otp.otp_purpose)

    const session = await authRepository.createSession({
      userId: otp.user_id,
      sessionType: 'email',
      expiresAt: new Date(Date.now() + EMAIL_SESSION_TTL_MS),
    })

    return { ok: true as const, sessionId: session.id, user }
  },

  async sendPasswordResetOtp(email: string) {
    const userRow = await usersService.getRowByEmail(email.toLowerCase())
    if (!userRow?.password_hash || !userRow.email) return { ok: true as const }

    const code = await issueOtpForUser(userRow.id, userRow.email, 'password_reset')
    const code_ = config.env === 'production' ? undefined : code
    return { ok: true as const, code: code_ }
  },

  async resetPasswordWithOtp(input: { email: string; code: string; password: string }) {
    const otp = await authRepository.getActiveOtpForEmail(
      input.email.toLowerCase(),
      input.code,
      'password_reset',
    )
    if (!otp) return undefined

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
    await usersService.updatePassword(otp.user_id, passwordHash)
    await authRepository.revokeUserOtpTokens(otp.user_id, 'password_reset')
    await authRepository.revokeUserResetTokens(otp.user_id)
    return { ok: true as const }
  },
}
