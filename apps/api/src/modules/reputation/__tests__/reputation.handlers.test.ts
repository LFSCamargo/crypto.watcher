import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockRequest, mockResponse } from '../../../test/http-mocks'
import { getReputationHandler } from '../handlers/get-reputation.handler'

vi.mock('../reputation.service', () => ({
  reputationService: {
    getByAddress: vi.fn(),
  },
}))

import { reputationService } from '../reputation.service'

const address = '0x1234567890123456789012345678901234567890'

describe('reputation handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getReputationHandler returns reputation for address', async () => {
    const reputation = {
      walletAddress: address,
      eligible: true,
      weight: '100',
      factors: { stake: '100' },
    }
    vi.mocked(reputationService.getByAddress).mockResolvedValue(reputation)

    const req = mockRequest({ params: { address } })
    const res = mockResponse()

    await getReputationHandler(req, res)

    expect(reputationService.getByAddress).toHaveBeenCalledWith(address)
    expect(res.body).toEqual(reputation)
  })
})
