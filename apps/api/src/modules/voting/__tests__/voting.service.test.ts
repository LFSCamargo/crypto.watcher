import { beforeEach, describe, expect, it, vi } from 'vitest'
import { votingService } from '../voting.service'

vi.mock('../voting.repository', () => ({
  votingRepository: {
    getTally: vi.fn(),
  },
}))

vi.mock('../../reputation/reputation.service', () => ({
  reputationService: {
    getByAddress: vi.fn(),
  },
}))

import { votingRepository } from '../voting.repository'
import { reputationService } from '../../reputation/reputation.service'

const projectId = '11111111-1111-4111-8111-111111111111'
const address = '0x1234567890123456789012345678901234567890'

describe('votingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getTally maps repository tally', async () => {
    vi.mocked(votingRepository.getTally).mockResolvedValue({
      weight_for: '75',
      weight_against: '25',
    })

    const result = await votingService.getTally(projectId)

    expect(votingRepository.getTally).toHaveBeenCalledWith(projectId, 1)
    expect(result).toEqual({
      projectId,
      round: 1,
      weightFor: '75',
      weightAgainst: '25',
    })
  })

  it('getTally accepts custom round', async () => {
    vi.mocked(votingRepository.getTally).mockResolvedValue({
      weight_for: '10',
      weight_against: '0',
    })

    const result = await votingService.getTally(projectId, 2)

    expect(votingRepository.getTally).toHaveBeenCalledWith(projectId, 2)
    expect(result.round).toBe(2)
  })

  it('getEligibility maps reputation data', async () => {
    vi.mocked(reputationService.getByAddress).mockResolvedValue({
      walletAddress: address,
      eligible: true,
      weight: '100',
      factors: null,
    })

    const result = await votingService.getEligibility(address)

    expect(reputationService.getByAddress).toHaveBeenCalledWith(address)
    expect(result).toEqual({
      address,
      eligible: true,
      weight: '100',
    })
  })
})
