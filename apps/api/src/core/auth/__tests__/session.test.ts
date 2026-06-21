import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '../../http/validation'
import { mockRequest, mockResponse } from '../../../test/http-mocks'
import { getSessionId, requireAuth, requireTeamOrAdmin } from '../session'

vi.mock('../../../modules/auth/auth.service', () => ({
  authService: {
    getSession: vi.fn(),
  },
  sessionCookieName: 'cw_session',
}))

import { authService } from '../../../modules/auth/auth.service'

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

describe('getSessionId', () => {
  it('parses session cookie from header', () => {
    const req = mockRequest({ headers: { cookie: 'cw_session=abc123; other=value' } })
    expect(getSessionId(req)).toBe('abc123')
  })

  it('returns undefined when cookie is missing', () => {
    expect(getSessionId(mockRequest())).toBeUndefined()
  })
})

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets user and sessionId on success', async () => {
    vi.mocked(authService.getSession).mockResolvedValue({ sessionId, user })

    const req = mockRequest({ headers: { cookie: `cw_session=${sessionId}` } })
    const res = mockResponse()
    const next = vi.fn()

    await requireAuth(req, res, next)

    expect(authService.getSession).toHaveBeenCalledWith(sessionId)
    expect(res.locals.user).toEqual(user)
    expect(res.locals.sessionId).toBe(sessionId)
    expect(next).toHaveBeenCalledWith()
  })

  it('rejects when session cookie is missing', async () => {
    const req = mockRequest()
    const res = mockResponse()
    const next = vi.fn()

    await requireAuth(req, res, next)

    expect(next).toHaveBeenCalledWith(new HttpError(401, 'Authentication required'))
  })

  it('rejects when session is invalid', async () => {
    vi.mocked(authService.getSession).mockResolvedValue(undefined)

    const req = mockRequest({ headers: { cookie: `cw_session=${sessionId}` } })
    const res = mockResponse()
    const next = vi.fn()

    await requireAuth(req, res, next)

    expect(next).toHaveBeenCalledWith(new HttpError(401, 'Authentication required'))
  })
})

describe('requireTeamOrAdmin', () => {
  it('allows team role', () => {
    const req = mockRequest()
    const res = mockResponse()
    res.locals.user = { ...user, role: 'team' }
    const next = vi.fn()

    requireTeamOrAdmin(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('allows admin role', () => {
    const req = mockRequest()
    const res = mockResponse()
    res.locals.user = { ...user, role: 'admin' }
    const next = vi.fn()

    requireTeamOrAdmin(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('rejects regular users', () => {
    const req = mockRequest()
    const res = mockResponse()
    res.locals.user = user
    const next = vi.fn()

    requireTeamOrAdmin(req, res, next)

    expect(next).toHaveBeenCalledWith(new HttpError(403, 'Team or admin role required'))
  })

  it('rejects when user is missing', () => {
    const req = mockRequest()
    const res = mockResponse()
    const next = vi.fn()

    requireTeamOrAdmin(req, res, next)

    expect(next).toHaveBeenCalledWith(new HttpError(403, 'Team or admin role required'))
  })
})
