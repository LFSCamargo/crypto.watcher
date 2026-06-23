import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '../../../core/http/validation'
import { mockRequest, mockResponse } from '../../../test/http-mocks'
import { getCurrentScoreHandler } from '../handlers/get-current-score.handler'
import { getScoreHistoryHandler } from '../handlers/get-score-history.handler'

vi.mock('../scoring.service', () => ({
  scoringService: {
    getCurrent: vi.fn(),
    getHistory: vi.fn(),
  },
}))

import { scoringService } from '../scoring.service'

const projectId = '11111111-1111-4111-8111-111111111111'

const score = {
  projectId,
  round: 1,
  value: '7500',
  breakdown: { weightFor: '75', weightAgainst: '25', totalWeight: '100' },
  creditRating: { sp: 'B' as const, moodys: 'B' as const, group: 'speculative_grade' as const },
}

describe('scoring handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getCurrentScoreHandler returns current score', async () => {
    vi.mocked(scoringService.getCurrent).mockResolvedValue(score)

    const req = mockRequest({ params: { id: projectId } })
    const res = mockResponse()

    await getCurrentScoreHandler(req, res)

    expect(scoringService.getCurrent).toHaveBeenCalledWith(projectId)
    expect(res.body).toEqual(score)
  })

  it('getCurrentScoreHandler returns 404 when score is missing', async () => {
    vi.mocked(scoringService.getCurrent).mockResolvedValue(undefined)

    const req = mockRequest({ params: { id: projectId } })
    const res = mockResponse()

    await expect(getCurrentScoreHandler(req, res)).rejects.toEqual(
      new HttpError(404, 'Score not found'),
    )
  })

  it('getScoreHistoryHandler returns score history', async () => {
    vi.mocked(scoringService.getHistory).mockResolvedValue([score])

    const req = mockRequest({ params: { id: projectId } })
    const res = mockResponse()

    await getScoreHistoryHandler(req, res)

    expect(scoringService.getHistory).toHaveBeenCalledWith(projectId)
    expect(res.body).toEqual([score])
  })
})
