import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockRequest, mockResponse } from '../../../test/http-mocks'
import { getVoteEligibilityHandler } from '../handlers/get-vote-eligibility.handler'
import { getVoteTallyHandler } from '../handlers/get-vote-tally.handler'

vi.mock('../voting.service', () => ({
  votingService: {
    getEligibility: vi.fn(),
    getTally: vi.fn(),
  },
}))

import { votingService } from '../voting.service'

const projectId = '11111111-1111-4111-8111-111111111111'
const address = '0x1234567890123456789012345678901234567890'

describe('voting handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getVoteEligibilityHandler returns eligibility', async () => {
    const eligibility = { address, eligible: true, weight: '100' }
    vi.mocked(votingService.getEligibility).mockResolvedValue(eligibility)

    const req = mockRequest({ query: { address } })
    const res = mockResponse()

    await getVoteEligibilityHandler(req, res)

    expect(votingService.getEligibility).toHaveBeenCalledWith(address)
    expect(res.body).toEqual(eligibility)
  })

  it('getVoteTallyHandler returns vote tally', async () => {
    const tally = { projectId, round: 1, weightFor: '75', weightAgainst: '25' }
    vi.mocked(votingService.getTally).mockResolvedValue(tally)

    const req = mockRequest({ params: { id: projectId } })
    const res = mockResponse()

    await getVoteTallyHandler(req, res)

    expect(votingService.getTally).toHaveBeenCalledWith(projectId)
    expect(res.body).toEqual(tally)
  })
})
