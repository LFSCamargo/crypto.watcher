import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mapUser, usersService } from '../users.service'

vi.mock('../users.repository', () => ({
  usersRepository: {
    getByAddress: vi.fn(),
    getByEmail: vi.fn(),
    getByNickname: vi.fn(),
    getById: vi.fn(),
    upsertByAddress: vi.fn(),
    createWithEmail: vi.fn(),
    updatePassword: vi.fn(),
    linkPublicKey: vi.fn(),
    updateMe: vi.fn(),
  },
}))

import { usersRepository } from '../users.repository'

const now = new Date('2024-01-01T00:00:00.000Z')

const row = {
  id: '33333333-3333-4333-8333-333333333333',
  wallet_address: '0x1234567890123456789012345678901234567890',
  email: 'test@example.com',
  password_hash: 'hash',
  public_key: null,
  x_account: null,
  nickname: 'testuser',
  display_name: 'Tester',
  avatar_url: null,
  bio: 'Bio',
  role: 'user' as const,
  created_at: now,
  updated_at: null,
  email_verified_at: null,
}

describe('usersService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mapUser omits password hash', () => {
    expect(mapUser(row)).toEqual({
      id: row.id,
      walletAddress: row.wallet_address,
      email: row.email,
      publicKey: row.public_key,
      xAccount: row.x_account,
      nickname: row.nickname,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      role: row.role,
      createdAt: now.toISOString(),
      emailVerifiedAt: null,
    })
  })

  it('getByAddress maps repository rows', async () => {
    vi.mocked(usersRepository.getByAddress).mockResolvedValue(row)

    const result = await usersService.getByAddress(row.wallet_address!)

    expect(result?.nickname).toBe('testuser')
  })

  it('getByAddress returns undefined when missing', async () => {
    vi.mocked(usersRepository.getByAddress).mockResolvedValue(undefined)

    await expect(usersService.getByAddress('0xmissing')).resolves.toBeUndefined()
  })

  it('getByEmail returns undefined when missing', async () => {
    vi.mocked(usersRepository.getByEmail).mockResolvedValue(undefined)

    await expect(usersService.getByEmail('missing@example.com')).resolves.toBeUndefined()
  })

  it('getByEmail maps repository rows', async () => {
    vi.mocked(usersRepository.getByEmail).mockResolvedValue(row)

    const result = await usersService.getByEmail(row.email!)

    expect(result?.email).toBe('test@example.com')
  })

  it('getByNickname returns undefined when missing', async () => {
    vi.mocked(usersRepository.getByNickname).mockResolvedValue(undefined)

    await expect(usersService.getByNickname('missing')).resolves.toBeUndefined()
  })

  it('getById maps repository rows', async () => {
    vi.mocked(usersRepository.getById).mockResolvedValue(row)

    const result = await usersService.getById(row.id)

    expect(result?.id).toBe(row.id)
  })

  it('getRowByEmail returns raw repository row', async () => {
    vi.mocked(usersRepository.getByEmail).mockResolvedValue(row)

    await expect(usersService.getRowByEmail(row.email!)).resolves.toEqual(row)
  })

  it('upsertByAddress maps repository rows', async () => {
    vi.mocked(usersRepository.upsertByAddress).mockResolvedValue(row)

    const result = await usersService.upsertByAddress(row.wallet_address!)

    expect(result.walletAddress).toBe(row.wallet_address)
  })

  it('createWithEmail maps repository rows', async () => {
    vi.mocked(usersRepository.createWithEmail).mockResolvedValue(row)

    const result = await usersService.createWithEmail({
      email: row.email!,
      passwordHash: 'hash',
      nickname: row.nickname,
    })

    expect(result.email).toBe(row.email)
  })

  it('updatePassword returns undefined when user is missing', async () => {
    vi.mocked(usersRepository.updatePassword).mockResolvedValue(undefined)

    await expect(usersService.updatePassword(row.id, 'new-hash')).resolves.toBeUndefined()
  })

  it('updatePassword maps updated user', async () => {
    vi.mocked(usersRepository.updatePassword).mockResolvedValue(row)

    const result = await usersService.updatePassword(row.id, 'new-hash')

    expect(result?.id).toBe(row.id)
  })

  it('linkPublicKey returns undefined when link fails', async () => {
    vi.mocked(usersRepository.linkPublicKey).mockResolvedValue(undefined)

    await expect(usersService.linkPublicKey(row.id, row.wallet_address!)).resolves.toBeUndefined()
  })

  it('linkPublicKey maps linked user', async () => {
    vi.mocked(usersRepository.linkPublicKey).mockResolvedValue(row)

    const result = await usersService.linkPublicKey(row.id, row.wallet_address!)

    expect(result?.walletAddress).toBe(row.wallet_address)
  })

  it('updateMe maps updated user', async () => {
    vi.mocked(usersRepository.updateMe).mockResolvedValue(row)

    const result = await usersService.updateMe(row.id, { displayName: 'Tester' })

    expect(result?.displayName).toBe('Tester')
  })

  it('updateMe returns undefined when user is missing', async () => {
    vi.mocked(usersRepository.updateMe).mockResolvedValue(undefined)

    await expect(usersService.updateMe(row.id, { displayName: 'Missing' })).resolves.toBeUndefined()
  })
})
