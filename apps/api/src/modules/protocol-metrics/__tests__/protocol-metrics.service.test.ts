import { describe, expect, it, vi } from 'vitest'
import { DAY_MS } from '../protocol-metrics-changes'
import {
  PROTOCOL_METRICS_CACHE_TTL_MS,
  ProtocolMetricsCache,
} from '../protocol-metrics.cache'
import type { ProtocolMetricsRepository } from '../protocol-metrics.repository'
import {
  ProtocolMetricsService,
  buildChainMetricsSnapshot,
  buildProtocolMetricsSnapshot,
  buildStablecoinMetricsSnapshot,
} from '../protocol-metrics.service'

describe('buildProtocolMetricsSnapshot', () => {
  it('computes TVL trends and normalizes exploit records', () => {
    const now = Date.now()
    const snapshot = buildProtocolMetricsSnapshot(
      'aave',
      'aave',
      {
        id: 'parent#aave',
        name: 'Aave',
        category: 'Lending',
        url: 'https://aave.com',
        chains: ['Ethereum'],
        tvl: [
          { date: Math.floor((now - 30 * DAY_MS) / 1000), totalLiquidityUSD: 10_000_000_000 },
          { date: Math.floor((now - 7 * DAY_MS) / 1000), totalLiquidityUSD: 11_000_000_000 },
          { date: Math.floor((now - DAY_MS) / 1000), totalLiquidityUSD: 12_000_000_000 },
          { date: Math.floor(now / 1000), totalLiquidityUSD: 12_600_000_000 },
        ],
        hacks: [
          {
            date: Math.floor(now / 1000) - 86_400,
            name: 'Aave V3',
            classification: 'Ecosystem',
            amount: 862_000,
            chain: ['Ethereum'],
            returnedFunds: 862_000,
          },
        ],
      },
      { total24h: 100_000, total7d: 700_000, total30d: 3_000_000, change_1d: 5.2 },
      { total24h: 50_000, total7d: 350_000, total30d: 1_500_000 },
      null,
      new Date(now),
    )

    expect(snapshot?.entityType).toBe('protocol')
    expect(snapshot?.tvl).toBe(12_600_000_000)
    expect(snapshot?.tvlChange7d).toBeCloseTo(14.545, 2)
    expect(snapshot?.fees24h).toBe(100_000)
    expect(snapshot?.exploitCount).toBe(1)
    expect(snapshot?.valuation).not.toBeNull()
    expect(snapshot?.valuation?.securityScore).toBeLessThan(100)
  })
})

describe('buildStablecoinMetricsSnapshot', () => {
  it('builds circulating supply metrics with chain breakdown', () => {
    const now = Math.floor(Date.now() / 1000)
    const snapshot = buildStablecoinMetricsSnapshot(
      'usd-coin',
      '2',
      {
        id: '2',
        name: 'USD Coin',
        symbol: 'USDC',
        url: 'https://www.circle.com/usdc/',
        pegMechanism: 'fiat-backed',
        currentChainBalances: {
          Ethereum: { peggedUSD: 40_000_000_000 },
          Base: { peggedUSD: 10_000_000_000 },
        },
        tokens: [
          { date: now - 30 * 86_400, circulating: { peggedUSD: 70_000_000_000 } },
          { date: now, circulating: { peggedUSD: 74_000_000_000 } },
        ],
      },
    )

    expect(snapshot?.entityType).toBe('stablecoin')
    expect(snapshot?.tvl).toBe(74_000_000_000)
    expect(snapshot?.category).toBe('Fiat-Backed stablecoin')
    expect(snapshot?.chainBreakdown[0]?.chain).toBe('Ethereum')
    expect(snapshot?.fees24h).toBeNull()
  })
})

describe('buildChainMetricsSnapshot', () => {
  it('builds chain TVL metrics with DEX volume and fees', () => {
    const now = Math.floor(Date.now() / 1000)
    const snapshot = buildChainMetricsSnapshot(
      'ethereum',
      'Ethereum',
      [
        { date: now - 86_400, tvl: 38_000_000_000 },
        { date: now, tvl: 39_000_000_000 },
      ],
      { total24h: 880_000_000, total7d: 6_500_000_000, total30d: 25_000_000_000, change_1d: 2.1 },
      { total24h: 7_500_000, total7d: 59_000_000, total30d: 240_000_000, change_1d: -1.2 },
    )

    expect(snapshot?.entityType).toBe('chain')
    expect(snapshot?.tvl).toBe(39_000_000_000)
    expect(snapshot?.dexVolume24h).toBe(880_000_000)
    expect(snapshot?.fees24h).toBe(7_500_000)
    expect(snapshot?.chainBreakdown).toEqual([])
  })
})

describe('ProtocolMetricsCache', () => {
  it('expires entries after the TTL', () => {
    vi.useFakeTimers()
    const cache = new ProtocolMetricsCache<{ value: number }>()
    cache.set('aave', { value: 1 }, 1_000)

    expect(cache.get('aave')).toEqual({ value: 1 })

    vi.advanceTimersByTime(1_001)
    expect(cache.get('aave')).toBeNull()

    vi.useRealTimers()
  })
})

function createRepositoryMock(
  overrides: Partial<ProtocolMetricsRepository> = {},
): ProtocolMetricsRepository {
  return {
    getFresh: vi.fn().mockResolvedValue(null),
    getAny: vi.fn().mockResolvedValue(null),
    upsert: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

function mockProtocolPayload(now: number) {
  return {
    id: 'aave',
    name: 'Aave',
    category: 'Lending',
    url: 'https://aave.com',
    chains: ['Ethereum'],
    currentChainTvls: { Ethereum: 12_600_000_000 },
    tokensInUsd: [{ WETH: 12_600_000_000 }],
    tvl: [
      { date: Math.floor((now - DAY_MS) / 1000), totalLiquidityUSD: 12_000_000_000 },
      { date: Math.floor(now / 1000), totalLiquidityUSD: 12_600_000_000 },
    ],
    hacks: [],
  }
}

describe('ProtocolMetricsService.getProjectProtocolMetrics', () => {
  it('returns in-memory cached data without calling DeFi Llama again', async () => {
    const fetchImpl = vi.fn()
    const repository = createRepositoryMock()
    const service = new ProtocolMetricsService(fetchImpl, repository)
    const now = Date.now()
    const cached = buildProtocolMetricsSnapshot(
      'aave',
      'aave',
      mockProtocolPayload(now),
      null,
      null,
      null,
      new Date(now),
    )

    service['memory'].set('protocol-metrics:v6:aave', cached!, PROTOCOL_METRICS_CACHE_TTL_MS)

    const snapshot = await service.getProjectProtocolMetrics('aave')

    expect(snapshot.tvl).toBe(12_600_000_000)
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(repository.getFresh).not.toHaveBeenCalled()
  })

  it('fetches protocol metrics, stores in DB, and caches in memory', async () => {
    const now = Date.now()
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockProtocolPayload(now),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ total24h: 100_000 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ total24h: 50_000 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 404,
        json: async () => ({}),
      })

    const repository = createRepositoryMock()
    const service = new ProtocolMetricsService(fetchImpl, repository)

    const snapshot = await service.getProjectProtocolMetrics('aave')

    expect(fetchImpl).toHaveBeenCalledTimes(4)
    expect(repository.upsert).toHaveBeenCalledOnce()
    expect(snapshot.slug).toBe('aave')
    expect(snapshot.entityType).toBe('protocol')
    expect(snapshot.fees24h).toBe(100_000)

    await service.getProjectProtocolMetrics('aave')
    expect(fetchImpl).toHaveBeenCalledTimes(4)
  })

  it('uses chain TVL when resolving layer-1 slugs', async () => {
    const now = Math.floor(Date.now() / 1000)
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [
          { date: now - 86_400, tvl: 38_000_000_000 },
          { date: now, tvl: 39_000_000_000 },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ total24h: 880_000_000 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ total24h: 7_500_000 }),
      })
    const repository = createRepositoryMock()
    const service = new ProtocolMetricsService(fetchImpl, repository)

    const snapshot = await service.getProjectProtocolMetrics('ethereum')

    expect(fetchImpl).toHaveBeenCalledTimes(3)
    expect(snapshot.entityType).toBe('chain')
    expect(snapshot.tvl).toBe(39_000_000_000)
    expect(snapshot.dexVolume24h).toBe(880_000_000)
    expect(snapshot.fees24h).toBe(7_500_000)
    expect(repository.upsert).toHaveBeenCalledOnce()
  })

  it('uses stablecoin supply data for tether', async () => {
    const now = Math.floor(Date.now() / 1000)
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: '1',
        name: 'Tether',
        pegMechanism: 'fiat-backed',
        currentChainBalances: {
          Ethereum: { peggedUSD: 100_000_000_000 },
        },
        tokens: [
          { date: now - 86_400, circulating: { peggedUSD: 180_000_000_000 } },
          { date: now, circulating: { peggedUSD: 186_000_000_000 } },
        ],
      }),
    })
    const repository = createRepositoryMock()
    const service = new ProtocolMetricsService(fetchImpl, repository)

    const snapshot = await service.getProjectProtocolMetrics('tether')

    expect(fetchImpl).toHaveBeenCalledOnce()
    expect(snapshot.entityType).toBe('stablecoin')
    expect(snapshot.tvl).toBe(186_000_000_000)
    expect(repository.upsert).toHaveBeenCalledOnce()
  })

  it('falls back to stale DB cache when DeFi Llama fails', async () => {
    const now = Date.now()
    const stale = buildProtocolMetricsSnapshot(
      'aave',
      'aave',
      mockProtocolPayload(now),
      null,
      null,
      null,
      new Date(now - PROTOCOL_METRICS_CACHE_TTL_MS * 2),
    )
    const repository = createRepositoryMock({
      getAny: vi.fn().mockResolvedValue(stale),
    })
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({}),
    })
    const service = new ProtocolMetricsService(fetchImpl, repository)

    const snapshot = await service.getProjectProtocolMetrics('aave')

    expect(snapshot.tvl).toBe(12_600_000_000)
    expect(snapshot.stale).toBe(true)
    expect(repository.getAny).toHaveBeenCalledWith('aave')
  })
})
