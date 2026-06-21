import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildSignInMessage, extractNonce, authService } from './auth.service'

vi.mock('./auth.repository', () => ({
  authRepository: {
    createSession: vi.fn(),
    getActiveSessionByNonce: vi.fn(),
    getActiveSessionById: vi.fn(),
    getActiveResetByToken: vi.fn(),
    revokeUserResetTokens: vi.fn(),
    revokeSession: vi.fn(),
  },
}))

vi.mock('../users/users.service', () => ({
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
  },
}))

import { authRepository } from './auth.repository'
import { usersService } from '../users/users.service'

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
    }))
    vi.mocked(authRepository.createSession).mockResolvedValue({
      id: 'session-1',
      user_id: 'user-1',
      session_type: 'email',
      nonce: null,
      expires_at: new Date(),
      revoked_at: null,
      created_at: new Date(),
    })

    const result = await authService.register({
      email: 'user@example.com',
      password: 'secret-password',
      nickname: 'alice',
    })

    expect(result.sessionId).toBe('session-1')
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
    })
    vi.mocked(authRepository.createSession).mockResolvedValue({
      id: 'session-2',
      user_id: 'user-1',
      session_type: 'email',
      nonce: null,
      expires_at: new Date(),
      revoked_at: null,
      created_at: new Date(),
    })

    const result = await authService.login({
      email: 'user@example.com',
      password: 'secret-password',
    })

    expect(result?.sessionId).toBe('session-2')
    expect(result?.user.email).toBe('user@example.com')
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
    })
    vi.mocked(authRepository.createSession).mockResolvedValue({
      id: 'reset-1',
      user_id: 'user-1',
      session_type: 'reset',
      nonce: 'token',
      expires_at: new Date(),
      revoked_at: null,
      created_at: new Date(),
    })

    const result = await authService.requestPasswordReset('user@example.com')

    expect(result.ok).toBe(true)
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
