import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '../../../core/http/validation'
import { mockRequest, mockResponse } from '../../../test/http-mocks'
import { createNonceHandler } from '../handlers/create-nonce.handler'
import { forgotPasswordHandler } from '../handlers/forgot-password.handler'
import { getMeHandler } from '../handlers/get-me.handler'
import { linkPublicKeyHandler } from '../handlers/link-public-key.handler'
import { loginHandler } from '../handlers/login.handler'
import { logoutHandler } from '../handlers/logout.handler'
import { registerHandler } from '../handlers/register.handler'
import { resetPasswordHandler } from '../handlers/reset-password.handler'
import { verifyHandler } from '../handlers/verify.handler'

vi.mock('../auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    revokeSession: vi.fn(),
    createNonce: vi.fn(),
    verify: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    linkPublicKey: vi.fn(),
  },
  sessionCookieName: 'cw_session',
}))

import { authService } from '../auth.service'

const userId = '33333333-3333-4333-8333-333333333333'
const sessionId = 'session-abc'

const user = {
  id: userId,
  walletAddress: null,
  email: 'test@example.com',
  publicKey: null,
  xAccount: null,
  nickname: 'testuser',
  displayName: null,
  avatarUrl: null,
  bio: null,
  role: 'user' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
  emailVerifiedAt: null,
}

describe('auth handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loginHandler sets session cookie and returns user', async () => {
    vi.mocked(authService.login).mockResolvedValue({ sessionId, user })

    const req = mockRequest({ body: { email: 'test@example.com', password: 'secret123' } })
    const res = mockResponse()

    await loginHandler(req, res)

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret123',
    })
    expect(res.cookie).toHaveBeenCalled()
    expect(res.body).toEqual({ user })
  })

  it('loginHandler returns 401 for invalid credentials', async () => {
    vi.mocked(authService.login).mockResolvedValue(undefined)

    const req = mockRequest({ body: { email: 'test@example.com', password: 'wrong' } })
    const res = mockResponse()

    await expect(loginHandler(req, res)).rejects.toEqual(
      new HttpError(401, 'Invalid email or password'),
    )
  })

  it('registerHandler creates account and sets session cookie', async () => {
    vi.mocked(authService.register).mockResolvedValue({ sessionId, user })

    const req = mockRequest({
      body: { email: 'new@example.com', password: 'password123', nickname: 'newbie' },
    })
    const res = mockResponse()

    await registerHandler(req, res)

    expect(res.statusCode).toBe(201)
    expect(res.cookie).toHaveBeenCalled()
    expect(res.body).toEqual({ user })
  })

  it('registerHandler returns 409 when email is taken', async () => {
    vi.mocked(authService.register).mockRejectedValue(new Error('EMAIL_TAKEN'))

    const req = mockRequest({ body: { email: 'taken@example.com', password: 'password123' } })
    const res = mockResponse()

    await expect(registerHandler(req, res)).rejects.toEqual(
      new HttpError(409, 'Email already registered'),
    )
  })

  it('registerHandler returns 409 when nickname is taken', async () => {
    vi.mocked(authService.register).mockRejectedValue(new Error('NICKNAME_TAKEN'))

    const req = mockRequest({
      body: { email: 'new@example.com', password: 'password123', nickname: 'taken' },
    })
    const res = mockResponse()

    await expect(registerHandler(req, res)).rejects.toEqual(
      new HttpError(409, 'Nickname already taken'),
    )
  })

  it('logoutHandler revokes session and clears cookie', async () => {
    const req = mockRequest()
    const res = mockResponse()
    res.locals.sessionId = sessionId

    await logoutHandler(req, res)

    expect(authService.revokeSession).toHaveBeenCalledWith(sessionId)
    expect(res.clearCookie).toHaveBeenCalledWith('cw_session')
    expect(res.statusCode).toBe(204)
  })

  it('getMeHandler returns authenticated user', () => {
    const req = mockRequest()
    const res = mockResponse()
    res.locals.user = user

    getMeHandler(req, res)

    expect(res.body).toEqual({ user })
  })

  it('createNonceHandler returns nonce payload', async () => {
    const nonce = { message: 'sign in', nonce: 'abc' }
    vi.mocked(authService.createNonce).mockResolvedValue(nonce)

    const req = mockRequest({ body: { address: '0x1234567890123456789012345678901234567890' } })
    const res = mockResponse()

    await createNonceHandler(req, res)

    expect(res.body).toEqual(nonce)
  })

  it('verifyHandler sets session cookie on valid signature', async () => {
    vi.mocked(authService.verify).mockResolvedValue({ sessionId, user })

    const req = mockRequest({
      body: {
        address: '0x1234567890123456789012345678901234567890',
        message: 'sign in',
        signature: '0xsig',
      },
    })
    const res = mockResponse()

    await verifyHandler(req, res)

    expect(res.cookie).toHaveBeenCalled()
    expect(res.body).toEqual({ user })
  })

  it('verifyHandler returns 401 for invalid signature', async () => {
    vi.mocked(authService.verify).mockResolvedValue(undefined)

    const req = mockRequest({
      body: {
        address: '0x1234567890123456789012345678901234567890',
        message: 'sign in',
        signature: '0xsig',
      },
    })
    const res = mockResponse()

    await expect(verifyHandler(req, res)).rejects.toEqual(
      new HttpError(401, 'Invalid signature'),
    )
  })

  it('forgotPasswordHandler returns reset result', async () => {
    const result = { ok: true as const, token: undefined }
    vi.mocked(authService.requestPasswordReset).mockResolvedValue(result)

    const req = mockRequest({ body: { email: 'test@example.com' } })
    const res = mockResponse()

    await forgotPasswordHandler(req, res)

    expect(res.body).toEqual(result)
  })

  it('resetPasswordHandler returns success result', async () => {
    const result = { ok: true as const }
    vi.mocked(authService.resetPassword).mockResolvedValue(result)

    const req = mockRequest({ body: { token: 'reset-token', password: 'newpassword' } })
    const res = mockResponse()

    await resetPasswordHandler(req, res)

    expect(res.body).toEqual(result)
  })

  it('resetPasswordHandler returns 400 for invalid token', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue(undefined)

    const req = mockRequest({ body: { token: 'bad-token', password: 'newpassword' } })
    const res = mockResponse()

    await expect(resetPasswordHandler(req, res)).rejects.toEqual(
      new HttpError(400, 'Invalid or expired reset token'),
    )
  })

  it('linkPublicKeyHandler links wallet for authenticated user', async () => {
    const linked = { ...user, publicKey: '0x1234567890123456789012345678901234567890' }
    vi.mocked(authService.linkPublicKey).mockResolvedValue(linked)

    const req = mockRequest({ body: { publicKey: '0x1234567890123456789012345678901234567890' } })
    const res = mockResponse()
    res.locals.user = user

    await linkPublicKeyHandler(req, res)

    expect(authService.linkPublicKey).toHaveBeenCalledWith(
      userId,
      '0x1234567890123456789012345678901234567890',
    )
    expect(res.body).toEqual({ user: linked })
  })

  it('linkPublicKeyHandler returns 400 for invalid public key', async () => {
    vi.mocked(authService.linkPublicKey).mockRejectedValue(new Error('INVALID_PUBLIC_KEY'))

    const req = mockRequest({ body: { publicKey: 'not-an-address' } })
    const res = mockResponse()
    res.locals.user = user

    await expect(linkPublicKeyHandler(req, res)).rejects.toEqual(
      new HttpError(400, 'Invalid wallet address format'),
    )
  })

  it('linkPublicKeyHandler returns 409 when wallet is taken', async () => {
    vi.mocked(authService.linkPublicKey).mockRejectedValue(new Error('WALLET_TAKEN'))

    const req = mockRequest({ body: { publicKey: '0x1234567890123456789012345678901234567890' } })
    const res = mockResponse()
    res.locals.user = user

    await expect(linkPublicKeyHandler(req, res)).rejects.toEqual(
      new HttpError(409, 'Wallet already linked to another account'),
    )
  })
})
