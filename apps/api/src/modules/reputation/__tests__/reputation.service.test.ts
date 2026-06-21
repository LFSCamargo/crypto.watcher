import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mapReputation, reputationService } from '../reputation.service'

vi.mock('../reputation.repository', () => ({
  reputationRepository: {
    getByAddress: vi.fn(),
  },
}))

import { reputationRepository } from '../reputation.repository'

const address = '0x1234567890123456789012345678901234567890'

const row = {
  wallet_address: address,
  eligible: true,
  weight: '100',
  factors: { stake: '100' },
  created_at: new Date('2024-01-01T00:00:00.000Z'),
  updated_at: null,
}

describe('reputationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mapReputation maps database rows', () => {
    expect(mapReputation(row)).toEqual({
      walletAddress: address,
      eligible: true,
      weight: '100',
      factors: { stake: '100' },
    })
  })

  it('getByAddress maps repository row', async () => {
    vi.mocked(reputationRepository.getByAddress).mockResolvedValue(row)

    const result = await reputationService.getByAddress(address)

    expect(result.eligible).toBe(true)
    expect(result.weight).toBe('100')
  })

  it('getByAddress returns default when reputation is missing', async () => {
    vi.mocked(reputationRepository.getByAddress).mockResolvedValue(undefined)

    const result = await reputationService.getByAddress(address)

    expect(result).toEqual({
      walletAddress: address,
      eligible: false,
      weight: '0',
      factors: null,
    })
  })
})
