import { beforeEach, describe, expect, it, vi } from 'vitest'
import { calculateScore, scoringService } from '../scoring.service'

vi.mock('../scoring.repository', () => ({
  scoringRepository: {
    getCurrent: vi.fn(),
    getHistory: vi.fn(),
    upsertScore: vi.fn(),
  },
}))

vi.mock('../../voting/voting.service', () => ({
  votingService: {
    getTally: vi.fn(),
  },
}))

import { scoringRepository } from '../scoring.repository'
import { votingService } from '../../voting/voting.service'

const projectId = '11111111-1111-4111-8111-111111111111'

const scoreRow = {
  id: '22222222-2222-4222-8222-222222222222',
  project_id: projectId,
  round: 1,
  value: '7500',
  breakdown: {
    weightFor: '75',
    weightAgainst: '25',
    totalWeight: '100',
  },
  created_at: new Date('2024-01-01T00:00:00.000Z'),
}

describe('calculateScore', () => {
  it('returns zero when there is no vote weight', () => {
    expect(calculateScore(0n, 0n)).toBe('0')
  })

  it('returns basis points of weighted support', () => {
    expect(calculateScore(75n, 25n)).toBe('7500')
  })
})

describe('scoringService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getCurrent maps repository score', async () => {
    vi.mocked(scoringRepository.getCurrent).mockResolvedValue(scoreRow)

    const result = await scoringService.getCurrent(projectId)

    expect(result).toEqual({
      projectId,
      round: 1,
      value: '7500',
      breakdown: scoreRow.breakdown,
      creditRating: { sp: 'B', moodys: 'B', group: 'speculative_grade' },
    })
  })

  it('getCurrent returns undefined when score is missing', async () => {
    vi.mocked(scoringRepository.getCurrent).mockResolvedValue(undefined)

    await expect(scoringService.getCurrent(projectId)).resolves.toBeUndefined()
  })

  it('getHistory maps repository scores', async () => {
    vi.mocked(scoringRepository.getHistory).mockResolvedValue([scoreRow])

    const result = await scoringService.getHistory(projectId)

    expect(result).toHaveLength(1)
    expect(result[0]?.value).toBe('7500')
  })

  it('calculateAndStore computes score from vote tally', async () => {
    vi.mocked(votingService.getTally).mockResolvedValue({
      projectId,
      round: 1,
      weightFor: '75',
      weightAgainst: '25',
    })
    vi.mocked(scoringRepository.upsertScore).mockResolvedValue(scoreRow)

    const result = await scoringService.calculateAndStore(projectId)

    expect(votingService.getTally).toHaveBeenCalledWith(projectId, 1)
    expect(scoringRepository.upsertScore).toHaveBeenCalledWith({
      projectId,
      round: 1,
      value: '7500',
      breakdown: {
        weightFor: '75',
        weightAgainst: '25',
        totalWeight: '100',
      },
    })
    expect(result.value).toBe('7500')
  })
})
