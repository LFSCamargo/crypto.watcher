import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockRequest, mockResponse } from '../../../test/http-mocks'
import { getProjectMarketHandler } from '../handlers/get-project-market.handler'

vi.mock('../market.service', () => ({
  marketService: {
    getProjectMarket: vi.fn(),
  },
}))

vi.mock('../market.cache', () => ({
  MARKET_CACHE_TTL_MS: 60_000,
}))

import { marketService } from '../market.service'

describe('market handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getProjectMarketHandler returns snapshot with cache header', async () => {
    const snapshot = {
      slug: 'bitcoin',
      coingeckoId: 'bitcoin',
      currency: 'usd' as const,
      price: 50000,
      change24h: 1.5,
      change7d: 3.2,
      change1m: 10.1,
      change1y: 50.0,
      history: [{ timestamp: 1_704_067_200, price: 50000 }],
      cachedAt: '2024-01-01T00:00:00.000Z',
      expiresAt: '2024-01-01T01:00:00.000Z',
    }
    vi.mocked(marketService.getProjectMarket).mockResolvedValue(snapshot)

    const req = mockRequest({ params: { slug: 'bitcoin' } })
    const res = mockResponse()
    const setHeader = vi.spyOn(res, 'set')

    await getProjectMarketHandler(req, res)

    expect(marketService.getProjectMarket).toHaveBeenCalledWith('bitcoin')
    expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=60')
    expect(res.body).toEqual(snapshot)
  })
})
