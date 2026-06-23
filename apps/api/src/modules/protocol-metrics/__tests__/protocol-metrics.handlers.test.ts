import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockRequest, mockResponse } from '../../../test/http-mocks'
import { getProjectProtocolMetricsHandler } from '../handlers/get-project-protocol-metrics.handler'

vi.mock('../protocol-metrics.service', () => ({
  protocolMetricsService: {
    getProjectProtocolMetrics: vi.fn(),
  },
}))

vi.mock('../protocol-metrics.cache', () => ({
  PROTOCOL_METRICS_CACHE_TTL_MS: 60_000,
}))

import { protocolMetricsService } from '../protocol-metrics.service'

describe('protocol-metrics handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getProjectProtocolMetricsHandler returns snapshot with cache header', async () => {
    const snapshot = {
      slug: 'aave',
      entityType: 'protocol' as const,
      defillamaId: 'protocol:aave',
      name: 'Aave',
      category: 'Lending',
      website: 'https://aave.com',
      chains: ['Ethereum'],
      mcap: 1_500_000_000,
      tvl: 12_600_000_000,
      tvlChange24h: 5,
      tvlChange7d: 10,
      tvlChange30d: 20,
      tvlHistory: [{ timestamp: 1_704_067_200_000, tvl: 12_600_000_000 }],
      chainBreakdown: [{ chain: 'Ethereum', tvl: 12_600_000_000, share: 100 }],
      tokenComposition: [{ symbol: 'WETH', usd: 12_600_000_000, share: 100 }],
      fees24h: 100_000,
      fees7d: 700_000,
      fees30d: 3_000_000,
      feesChange1d: 1.2,
      feesHistory: [{ timestamp: 1_704_067_200_000, value: 100_000 }],
      revenue24h: 50_000,
      revenue7d: 350_000,
      revenue30d: 1_500_000,
      revenueHistory: [{ timestamp: 1_704_067_200_000, value: 50_000 }],
      dexVolume24h: null,
      dexVolume7d: null,
      dexVolume30d: null,
      dexVolumeChange1d: null,
      dexVolumeHistory: [],
      exploits: [],
      exploitCount: 0,
      totalExploitLossUsd: null,
      snapshotVersion: 2,
      cachedAt: '2024-01-01T00:00:00.000Z',
      expiresAt: '2024-01-01T01:00:00.000Z',
    }
    vi.mocked(protocolMetricsService.getProjectProtocolMetrics).mockResolvedValue(snapshot)

    const req = mockRequest({ params: { slug: 'aave' } })
    const res = mockResponse()
    const setHeader = vi.spyOn(res, 'set')

    await getProjectProtocolMetricsHandler(req, res)

    expect(protocolMetricsService.getProjectProtocolMetrics).toHaveBeenCalledWith('aave')
    expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=60')
    expect(res.body).toEqual(snapshot)
  })
})
