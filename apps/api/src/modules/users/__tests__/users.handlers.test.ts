import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '../../../core/http/validation'
import { mockRequest, mockResponse } from '../../../test/http-mocks'
import { getMeHandler } from '../handlers/get-me.handler'
import { getUserByIdentifierHandler } from '../handlers/get-user-by-identifier.handler'
import { updateMeHandler } from '../handlers/update-me.handler'

vi.mock('../users.service', () => ({
  usersService: {
    getByAddress: vi.fn(),
    getByNickname: vi.fn(),
    getById: vi.fn(),
    updateMe: vi.fn(),
  },
}))

import { usersService } from '../users.service'

const userId = '33333333-3333-4333-8333-333333333333'
const address = '0x1234567890123456789012345678901234567890'

const user = {
  id: userId,
  walletAddress: address,
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

describe('users handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getUserByIdentifierHandler returns user by nickname', async () => {
    vi.mocked(usersService.getByNickname).mockResolvedValue(user)

    const req = mockRequest({ params: { identifier: 'testuser' } })
    const res = mockResponse()

    await getUserByIdentifierHandler(req, res)

    expect(usersService.getByNickname).toHaveBeenCalledWith('testuser')
    expect(res.body).toEqual(user)
  })

  it('getUserByIdentifierHandler returns user by address', async () => {
    vi.mocked(usersService.getByAddress).mockResolvedValue(user)

    const req = mockRequest({ params: { identifier: address } })
    const res = mockResponse()

    await getUserByIdentifierHandler(req, res)

    expect(usersService.getByAddress).toHaveBeenCalledWith(address)
    expect(res.body).toEqual(user)
  })

  it('getUserByIdentifierHandler returns 404 when user is missing', async () => {
    vi.mocked(usersService.getByNickname).mockResolvedValue(undefined)

    const req = mockRequest({ params: { identifier: 'missing' } })
    const res = mockResponse()

    await expect(getUserByIdentifierHandler(req, res)).rejects.toEqual(
      new HttpError(404, 'User not found'),
    )
  })

  it('getMeHandler returns the authenticated user profile', async () => {
    vi.mocked(usersService.getById).mockResolvedValue(user)

    const req = mockRequest()
    const res = mockResponse()
    res.locals.user = user

    await getMeHandler(req, res)

    expect(usersService.getById).toHaveBeenCalledWith(userId)
    expect(res.body).toEqual(user)
  })

  it('getMeHandler returns 404 when user is missing', async () => {
    vi.mocked(usersService.getById).mockResolvedValue(undefined)

    const req = mockRequest()
    const res = mockResponse()
    res.locals.user = user

    await expect(getMeHandler(req, res)).rejects.toEqual(new HttpError(404, 'User not found'))
  })

  it('updateMeHandler updates authenticated user profile', async () => {
    const updated = { ...user, displayName: 'Tester' }
    vi.mocked(usersService.updateMe).mockResolvedValue(updated)

    const req = mockRequest({ body: { displayName: 'Tester' } })
    const res = mockResponse()
    res.locals.user = user

    await updateMeHandler(req, res)

    expect(usersService.updateMe).toHaveBeenCalledWith(userId, { displayName: 'Tester' })
    expect(res.body).toEqual(updated)
  })

  it('updateMeHandler returns 404 when user is missing', async () => {
    vi.mocked(usersService.updateMe).mockResolvedValue(undefined)

    const req = mockRequest({ body: { displayName: 'Tester' } })
    const res = mockResponse()
    res.locals.user = user

    await expect(updateMeHandler(req, res)).rejects.toEqual(new HttpError(404, 'User not found'))
  })
})
