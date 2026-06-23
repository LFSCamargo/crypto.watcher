import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildSignInMessage, extractNonce, authService, generateOtpCode } from '../auth.service'

vi.mock('../../../core/config', () => ({
  config: {
    env: 'development',
    webUrl: 'http://localhost:5173',
  },
}))

vi.mock('../../../core/mail/mail.service', () => ({
  mailService: {
    sendOtpEmail: vi.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>()
  return {
    ...actual,
    verifyMessage: vi.fn(),
    isAddress: vi.fn((value: string) => /^0x[a-fA-F0-9]{40}$/.test(value)),
  }
})

vi.mock('../auth.repository', () => ({
  authRepository: {
    createSession: vi.fn(),
    getActiveSessionByNonce: vi.fn(),
    getActiveSessionById: vi.fn(),
    getActiveResetByToken: vi.fn(),
    revokeUserResetTokens: vi.fn(),
    revokeUserOtpTokens: vi.fn(),
    getActiveOtpForEmail: vi.fn(),
    getActiveAuthOtpForEmail: vi.fn(),
    revokeSession: vi.fn(),
  },
}))

vi.mock('../../users/users.service', () => ({
  mapUser: (user: {
    id: string
    wallet_address: string | null
    email: string | null
    public_key: string | null
    x_account: string | null
    nickname: string | null
    display_name: string | null
    avatar_url: string | null
    bio: string | null
    role: 'user' | 'team' | 'admin'
    created_at: Date
    updated_at: Date | null
  }) => ({
    id: user.id,
    walletAddress: user.wallet_address,
    email: user.email,
    publicKey: user.public_key,
    xAccount: user.x_account,
    nickname: user.nickname,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    role: user.role,
    createdAt: user.created_at.toISOString(),
    emailVerifiedAt: null,
  }),
  usersService: {
    upsertByAddress: vi.fn(),
    getByEmail: vi.fn(),
    getByNickname: vi.fn(),
    getRowByEmail: vi.fn(),
    createWithEmail: vi.fn(),
    linkPublicKey: vi.fn(),
    updatePassword: vi.fn(),
    getByAddress: vi.fn(),
    markEmailVerified: vi.fn(),
  },
}))

import { authRepository } from '../auth.repository'
import { usersService } from '../../users/users.service'
import { verifyMessage } from 'viem'
import { mailService } from '../../../core/mail/mail.service'

const walletAddress = '0x1234567890123456789012345678901234567890'

const walletSessionRow = {
  session_id: 'wallet-session-1',
  expires_at: new Date(Date.now() + 60_000),
  revoked_at: null,
  user_id: 'user-wallet',
  wallet_address: walletAddress,
  email: null,
  public_key: null,
  x_account: null,
  nickname: null,
  display_name: null,
  avatar_url: null,
  bio: null,
  role: 'user' as const,
  created_at: new Date(),
  updated_at: null,
  email_verified_at: null,
}

describe('auth message helpers', () => {
  it('embeds and extracts nonce from sign-in message', () => {
    const message = buildSignInMessage('0xABCDEF', 'abc123')

    expect(message).toContain('Address: 0xabcdef')
    expect(extractNonce(message)).toBe('abc123')
  })

  it('returns undefined when nonce is missing', () => {
    expect(extractNonce('invalid message')).toBeUndefined()
  })
})

describe('authService email/password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers a user with a bcrypt password hash', async () => {
    vi.mocked(usersService.getByEmail).mockResolvedValue(undefined)
    vi.mocked(usersService.getByNickname).mockResolvedValue(undefined)
    vi.mocked(usersService.createWithEmail).mockImplementation(async (input) => ({
      id: 'user-1',
      walletAddress: null,
      email: input.email,
      publicKey: null,
      xAccount: null,
      nickname: input.nickname,
      displayName: null,
      avatarUrl: null,
      bio: null,
      role: 'user',
      createdAt: new Date().toISOString(),
      emailVerifiedAt: null,
    }))
    vi.mocked(authRepository.createSession).mockResolvedValue({
      id: 'session-1',
      user_id: 'user-1',
      session_type: 'email',
      nonce: null,
      otp_purpose: null,
      expires_at: new Date(),
      revoked_at: null,
      created_at: new Date(),
    })

    const result = await authService.register({
      email: 'user@example.com',
      password: 'secret-password',
      nickname: 'alice',
    })

    expect(result).toEqual({ ok: true, email: 'user@example.com' })
    expect(authRepository.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ sessionType: 'otp', otpPurpose: 'verify_email' }),
    )
    expect(authRepository.createSession).not.toHaveBeenCalledWith(
      expect.objectContaining({ sessionType: 'email' }),
    )
    expect(usersService.createWithEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        nickname: 'alice',
        passwordHash: expect.any(String),
      }),
    )

    const createCall = vi.mocked(usersService.createWithEmail).mock.calls[0]?.[0]
    expect(createCall).toBeDefined()
    const passwordHash = createCall!.passwordHash
    expect(await bcrypt.compare('secret-password', passwordHash)).toBe(true)
    expect(mailService.sendOtpEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        purpose: 'verify_email',
      }),
    )
  })

  it('logs in when the password matches', async () => {
    const passwordHash = await bcrypt.hash('secret-password', 10)
    vi.mocked(usersService.getRowByEmail).mockResolvedValue({
      id: 'user-1',
      wallet_address: null,
      email: 'user@example.com',
      password_hash: passwordHash,
      public_key: null,
      x_account: null,
      nickname: null,
      display_name: null,
      avatar_url: null,
      bio: null,
      role: 'user',
      created_at: new Date(),
      updated_at: null,
      email_verified_at: new Date(),
    })
    vi.mocked(authRepository.createSession).mockResolvedValue({
      id: 'otp-1',
      user_id: 'user-1',
      session_type: 'otp',
      nonce: '123456',
      otp_purpose: 'sign_in',
      expires_at: new Date(),
      revoked_at: null,
      created_at: new Date(),
    })

    const result = await authService.login({
      email: 'user@example.com',
      password: 'secret-password',
    })

    expect(result).toEqual({ ok: true, email: 'user@example.com' })
    expect(authRepository.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ sessionType: 'otp', otpPurpose: 'sign_in' }),
    )
    expect(authRepository.createSession).not.toHaveBeenCalledWith(
      expect.objectContaining({ sessionType: 'email' }),
    )
    expect(mailService.sendOtpEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        purpose: 'sign_in',
      }),
    )
  })

  it('returns undefined when login password is wrong', async () => {
    const passwordHash = await bcrypt.hash('secret-password', 10)
    vi.mocked(usersService.getRowByEmail).mockResolvedValue({
      id: 'user-1',
      wallet_address: null,
      email: 'user@example.com',
      password_hash: passwordHash,
      public_key: null,
      x_account: null,
      nickname: null,
      display_name: null,
      avatar_url: null,
      bio: null,
      role: 'user',
      created_at: new Date(),
      updated_at: null,
      email_verified_at: null,
    })

    const result = await authService.login({
      email: 'user@example.com',
      password: 'wrong-password',
    })

    expect(result).toBeUndefined()
  })
})

describe('authService password reset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('issues a reset token only for accounts with a password', async () => {
    vi.mocked(usersService.getRowByEmail).mockResolvedValue({
      id: 'user-1',
      wallet_address: null,
      email: 'user@example.com',
      password_hash: await bcrypt.hash('old-password', 10),
      public_key: null,
      x_account: null,
      nickname: null,
      display_name: null,
      avatar_url: null,
      bio: null,
      role: 'user',
      created_at: new Date(),
      updated_at: null,
      email_verified_at: null,
    })
    vi.mocked(authRepository.createSession).mockResolvedValue({
      id: 'reset-1',
      user_id: 'user-1',
      session_type: 'reset',
      nonce: 'token',
      otp_purpose: null,
      expires_at: new Date(),
      revoked_at: null,
      created_at: new Date(),
    })

    const result = await authService.requestPasswordReset('user@example.com')

    expect(result.ok).toBe(true)
    expect(result.token).toBeDefined()
    expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        resetUrl: expect.stringContaining('/auth/reset-password?token='),
      }),
    )
    expect(authRepository.revokeUserResetTokens).toHaveBeenCalledWith('user-1')
    expect(authRepository.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', sessionType: 'reset' }),
    )
  })

  it('does not reveal whether an email exists', async () => {
    vi.mocked(usersService.getRowByEmail).mockResolvedValue(undefined)

    const result = await authService.requestPasswordReset('nobody@example.com')

    expect(result.ok).toBe(true)
    expect(result.token).toBeUndefined()
    expect(authRepository.createSession).not.toHaveBeenCalled()
  })

  it('rejects an invalid reset token', async () => {
    vi.mocked(authRepository.getActiveResetByToken).mockResolvedValue(undefined)

    const result = await authService.resetPassword({ token: 'bad', password: 'new-password' })

    expect(result).toBeUndefined()
    expect(usersService.updatePassword).not.toHaveBeenCalled()
  })

  it('updates the password and revokes tokens for a valid reset', async () => {
    vi.mocked(authRepository.getActiveResetByToken).mockResolvedValue({
      id: 'reset-1',
      user_id: 'user-1',
      expires_at: new Date(Date.now() + 60_000),
    })

    const result = await authService.resetPassword({
      token: 'good-token',
      password: 'brand-new-password',
    })

    expect(result?.ok).toBe(true)
    expect(usersService.updatePassword).toHaveBeenCalledWith('user-1', expect.any(String))
    expect(authRepository.revokeUserResetTokens).toHaveBeenCalledWith('user-1')
  })
})

describe('authService wallet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createNonce upserts wallet user and stores nonce session', async () => {
    vi.mocked(usersService.upsertByAddress).mockResolvedValue({
      id: 'user-wallet',
      walletAddress,
      email: null,
      publicKey: null,
      xAccount: null,
      nickname: null,
      displayName: null,
      avatarUrl: null,
      bio: null,
      role: 'user',
      createdAt: new Date().toISOString(),
      emailVerifiedAt: null,
    })
    vi.mocked(authRepository.createSession).mockResolvedValue({
      id: 'session-wallet',
      user_id: 'user-wallet',
      session_type: 'wallet',
      nonce: 'abc123',
      otp_purpose: null,
      expires_at: new Date(),
      revoked_at: null,
      created_at: new Date(),
    })

    const result = await authService.createNonce(walletAddress)

    expect(result.nonce).toEqual(expect.any(String))
    expect(result.message).toContain(walletAddress.toLowerCase())
    expect(authRepository.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-wallet', sessionType: 'wallet' }),
    )
  })

  it('verify returns session when signature is valid', async () => {
    const nonce = 'abc123'
    const message = buildSignInMessage(walletAddress, nonce)
    vi.mocked(authRepository.getActiveSessionByNonce).mockResolvedValue(walletSessionRow)
    vi.mocked(verifyMessage).mockResolvedValue(true)

    const result = await authService.verify({
      address: walletAddress,
      message,
      signature: '0xsig',
    })

    expect(result?.sessionId).toBe('wallet-session-1')
    expect(result?.user.walletAddress).toBe(walletAddress)
  })

  it('verify rejects invalid signatures and mismatched sessions', async () => {
    const nonce = 'abc123'
    const message = buildSignInMessage(walletAddress, nonce)

    await expect(
      authService.verify({ address: walletAddress, message: 'invalid', signature: '0xsig' }),
    ).resolves.toBeUndefined()

    vi.mocked(authRepository.getActiveSessionByNonce).mockResolvedValue(undefined)
    await expect(
      authService.verify({ address: walletAddress, message, signature: '0xsig' }),
    ).resolves.toBeUndefined()

    vi.mocked(authRepository.getActiveSessionByNonce).mockResolvedValue({
      ...walletSessionRow,
      wallet_address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    })
    await expect(
      authService.verify({ address: walletAddress, message, signature: '0xsig' }),
    ).resolves.toBeUndefined()

    vi.mocked(authRepository.getActiveSessionByNonce).mockResolvedValue(walletSessionRow)
    vi.mocked(verifyMessage).mockResolvedValue(false)
    await expect(
      authService.verify({ address: walletAddress, message, signature: '0xsig' }),
    ).resolves.toBeUndefined()
  })

  it('getSession maps active sessions', async () => {
    vi.mocked(authRepository.getActiveSessionById).mockResolvedValue(walletSessionRow)

    const result = await authService.getSession('wallet-session-1')

    expect(result?.user.id).toBe('user-wallet')
  })

  it('getSession returns undefined for missing sessions', async () => {
    vi.mocked(authRepository.getActiveSessionById).mockResolvedValue(undefined)

    await expect(authService.getSession('missing')).resolves.toBeUndefined()
  })
})

describe('authService linkPublicKey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('links a valid wallet to the current user', async () => {
    vi.mocked(usersService.getByAddress).mockResolvedValue(undefined)
    vi.mocked(usersService.linkPublicKey).mockResolvedValue({
      id: 'user-1',
      walletAddress,
      email: 'user@example.com',
      publicKey: walletAddress,
      xAccount: null,
      nickname: null,
      displayName: null,
      avatarUrl: null,
      bio: null,
      role: 'user',
      createdAt: new Date().toISOString(),
      emailVerifiedAt: null,
    })

    const result = await authService.linkPublicKey('user-1', walletAddress)

    expect(result.walletAddress).toBe(walletAddress)
  })

  it('rejects invalid wallet addresses and taken wallets', async () => {
    await expect(authService.linkPublicKey('user-1', 'not-a-wallet')).rejects.toThrow(
      'INVALID_PUBLIC_KEY',
    )

    vi.mocked(usersService.getByAddress).mockResolvedValue({
      id: 'other-user',
      walletAddress,
      email: null,
      publicKey: walletAddress,
      xAccount: null,
      nickname: null,
      displayName: null,
      avatarUrl: null,
      bio: null,
      role: 'user',
      createdAt: new Date().toISOString(),
      emailVerifiedAt: null,
    })

    await expect(authService.linkPublicKey('user-1', walletAddress)).rejects.toThrow('WALLET_TAKEN')

    vi.mocked(usersService.getByAddress).mockResolvedValue(undefined)
    vi.mocked(usersService.linkPublicKey).mockResolvedValue(undefined)

    await expect(authService.linkPublicKey('user-1', walletAddress)).rejects.toThrow(
      'USER_NOT_FOUND',
    )
  })
})

describe('authService email conflicts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects duplicate email registration', async () => {
    vi.mocked(usersService.getByEmail).mockResolvedValue({
      id: 'existing',
      walletAddress: null,
      email: 'user@example.com',
      publicKey: null,
      xAccount: null,
      nickname: null,
      displayName: null,
      avatarUrl: null,
      bio: null,
      role: 'user',
      createdAt: new Date().toISOString(),
      emailVerifiedAt: null,
    })

    await expect(
      authService.register({
        email: 'user@example.com',
        password: 'secret-password',
      }),
    ).rejects.toThrow('EMAIL_TAKEN')
  })

  it('rejects duplicate nicknames', async () => {
    vi.mocked(usersService.getByEmail).mockResolvedValue(undefined)
    vi.mocked(usersService.getByNickname).mockResolvedValue({
      id: 'existing',
      walletAddress: null,
      email: null,
      publicKey: null,
      xAccount: null,
      nickname: 'alice',
      displayName: null,
      avatarUrl: null,
      bio: null,
      role: 'user',
      createdAt: new Date().toISOString(),
      emailVerifiedAt: null,
    })

    await expect(
      authService.register({
        email: 'user@example.com',
        password: 'secret-password',
        nickname: 'alice',
      }),
    ).rejects.toThrow('NICKNAME_TAKEN')
  })
})

describe('authService OTP emails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generateOtpCode returns a 6-digit code', () => {
    expect(generateOtpCode()).toMatch(/^\d{6}$/)
  })

  it('verifies email OTP, creates a session, and marks the user verified', async () => {
    vi.mocked(authRepository.getActiveAuthOtpForEmail).mockResolvedValue({
      id: 'otp-1',
      user_id: 'user-1',
      expires_at: new Date(Date.now() + 60_000),
      otp_purpose: 'verify_email',
    })
    vi.mocked(usersService.markEmailVerified).mockResolvedValue({
      id: 'user-1',
      walletAddress: null,
      email: 'user@example.com',
      publicKey: null,
      xAccount: null,
      nickname: null,
      displayName: null,
      avatarUrl: null,
      bio: null,
      role: 'user',
      createdAt: new Date().toISOString(),
      emailVerifiedAt: new Date().toISOString(),
    })
    vi.mocked(authRepository.createSession).mockResolvedValue({
      id: 'session-1',
      user_id: 'user-1',
      session_type: 'email',
      nonce: null,
      otp_purpose: null,
      expires_at: new Date(),
      revoked_at: null,
      created_at: new Date(),
    })

    const result = await authService.verifyEmailOtp({
      email: 'user@example.com',
      code: '123456',
    })

    expect(result?.ok).toBe(true)
    expect(result?.sessionId).toBe('session-1')
    expect(usersService.markEmailVerified).toHaveBeenCalledWith('user-1')
    expect(authRepository.revokeUserOtpTokens).toHaveBeenCalledWith('user-1', 'verify_email')
  })

  it('sends password reset OTP emails for password accounts', async () => {
    vi.mocked(usersService.getRowByEmail).mockResolvedValue({
      id: 'user-1',
      wallet_address: null,
      email: 'user@example.com',
      password_hash: 'hash',
      public_key: null,
      x_account: null,
      nickname: null,
      display_name: null,
      avatar_url: null,
      bio: null,
      role: 'user',
      created_at: new Date(),
      updated_at: null,
      email_verified_at: null,
    })
    vi.mocked(authRepository.createSession).mockResolvedValue({
      id: 'otp-1',
      user_id: 'user-1',
      session_type: 'otp',
      nonce: '123456',
      otp_purpose: 'password_reset',
      expires_at: new Date(),
      revoked_at: null,
      created_at: new Date(),
    })

    const result = await authService.sendPasswordResetOtp('user@example.com')

    expect(result.ok).toBe(true)
    expect(mailService.sendOtpEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        purpose: 'password_reset',
      }),
    )
  })
})
