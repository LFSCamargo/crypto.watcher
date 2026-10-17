import { describe, expect, it, vi } from 'vitest'
import { DAY_MS } from '../market-changes'
import { resolveCoingeckoId } from '../coingecko-ids'
import { MARKET_CACHE_TTL_MS, MARKET_RETENTION_MS, MarketCache } from '../market.cache'
import type { MarketRepository } from '../market.repository'
import { MarketService, buildMarketSnapshot, findClosestPrice } from '../market.service'

describe('resolveCoingeckoId', () => {
  it('maps known slug overrides', () => {
    expect(resolveCoingeckoId('xrp')).toBe('ripple')
    expect(resolveCoingeckoId('bnb')).toBe('binancecoin')
    expect(resolveCoingeckoId('avalanche')).toBe('avalanche-2')
    expect(resolveCoingeckoId('marinade')).toBe('marinade')
  })

  it('resolves base and linea network tokens', () => {
    expect(resolveCoingeckoId('base')).toBe('base')
    expect(resolveCoingeckoId('linea')).toBe('linea')
  })

  it('falls back to slug when no override exists', () => {
    expect(resolveCoingeckoId('bitcoin')).toBe('bitcoin')
    expect(resolveCoingeckoId('monero')).toBe('monero')
  })
})

describe('findClosestPrice', () => {
  it('returns the nearest historical price to a target timestamp', () => {
    const prices: [number, number][] = [
      [1_000, 10],
      [2_000, 20],
      [3_000, 30],
    ]

    expect(findClosestPrice(prices, 2_100)).toBe(20)
    expect(findClosestPrice(prices, 500)).toBe(10)
  })
})

describe('buildMarketSnapshot', () => {
  it('computes current price and percentage changes across all windows', () => {
    const now = Date.now()
    const prices: [number, number][] = [
      [now - 365 * DAY_MS, 80],
      [now - 30 * DAY_MS, 100],
      [now - 7 * DAY_MS, 110],
      [now - DAY_MS, 115],
      [now, 121],
    ]

    const snapshot = buildMarketSnapshot('bitcoin', 'bitcoin', prices, new Date(now))

    expect(snapshot.price).toBe(121)
    expect(snapshot.change24h).toBeCloseTo(5.217, 2)
    expect(snapshot.change7d).toBeCloseTo(10, 5)
    expect(snapshot.change1m).toBeCloseTo(21, 5)
    expect(snapshot.change1y).toBeCloseTo(51.25, 2)
    expect(snapshot.history).toHaveLength(5)
  })
})

describe('MarketCache', () => {
  it('expires entries after the TTL', () => {
    vi.useFakeTimers()
    const cache = new MarketCache<{ value: number }>()
    cache.set('bitcoin', { value: 1 }, 1_000)

    expect(cache.get('bitcoin')).toEqual({ value: 1 })

    vi.advanceTimersByTime(1_001)
    expect(cache.get('bitcoin')).toBeNull()

    vi.useRealTimers()
  })
})

function createRepositoryMock(overrides: Partial<MarketRepository> = {}): MarketRepository {
  return {
    getFresh: vi.fn().mockResolvedValue(null),
    getAny: vi.fn().mockResolvedValue(null),
    upsert: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe('MarketService.getProjectMarket', () => {
  it('returns in-memory cached data without calling CoinGecko again', async () => {
    const fetchImpl = vi.fn()
    const repository = createRepositoryMock()
    const service = new MarketService(fetchImpl, repository)

    const now = Date.now()
    service['memory'].set(
      'project:v3:bitcoin',
      buildMarketSnapshot(
        'bitcoin',
        'bitcoin',
        [
          [now - 7 * 24 * 60 * 60 * 1000, 100],
          [now, 110],
        ],
        new Date(now),
      ),
      MARKET_CACHE_TTL_MS,
    )

    const snapshot = await service.getProjectMarket('bitcoin')

    expect(snapshot.price).toBe(110)
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(repository.getFresh).not.toHaveBeenCalled()
  })

  it('returns fresh DB cache without calling CoinGecko', async () => {
    const now = Date.now()
    const cached = buildMarketSnapshot(
      'bitcoin',
      'bitcoin',
      [
        [now - DAY_MS, 100],
        [now, 110],
      ],
      new Date(now),
    )
    const repository = createRepositoryMock({
      getFresh: vi.fn().mockResolvedValue(cached),
    })
    const service = new MarketService(vi.fn(), repository)

    const snapshot = await service.getProjectMarket('bitcoin')

    expect(snapshot.price).toBe(110)
    expect(repository.getFresh).toHaveBeenCalledWith('bitcoin')
  })

  it('fetches from CoinGecko, stores in DB, and caches in memory', async () => {
    const now = Date.now()
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        prices: [
          [now - 7 * 24 * 60 * 60 * 1000, 100],
          [now, 120],
        ],
      }),
    })
    const repository = createRepositoryMock()
    const service = new MarketService(fetchImpl, repository)

    const snapshot = await service.getProjectMarket('ethereum')

    expect(fetchImpl).toHaveBeenCalledOnce()
    expect(repository.upsert).toHaveBeenCalledOnce()
    expect(snapshot.slug).toBe('ethereum')
    expect(snapshot.price).toBe(120)

    await service.getProjectMarket('ethereum')
    expect(fetchImpl).toHaveBeenCalledOnce()
  })

  it('falls back to stale DB cache when CoinGecko fails', async () => {
    const now = Date.now()
    const stale = buildMarketSnapshot(
      'bitcoin',
      'bitcoin',
      [
        [now - DAY_MS, 95],
        [now, 100],
      ],
      new Date(now - MARKET_CACHE_TTL_MS * 2),
    )
    const repository = createRepositoryMock({
      getAny: vi.fn().mockResolvedValue(stale),
    })
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({}),
    })
    const service = new MarketService(fetchImpl, repository)

    const snapshot = await service.getProjectMarket('bitcoin')

    expect(snapshot.price).toBe(100)
    expect(snapshot.stale).toBe(true)
    expect(repository.getAny).toHaveBeenCalledWith('bitcoin')
  })

  it('rejects a database snapshot older than a week when CoinGecko fails', async () => {
    const now = Date.now()
    const ancient = buildMarketSnapshot(
      'bitcoin',
      'bitcoin',
      [
        [now - DAY_MS, 95],
        [now, 100],
      ],
      new Date(now - MARKET_RETENTION_MS - DAY_MS),
    )
    const repository = createRepositoryMock({
      getAny: vi.fn().mockResolvedValue(ancient),
    })
    const service = new MarketService(
      vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({}) }),
      repository,
    )

    await expect(service.getProjectMarket('bitcoin')).rejects.toMatchObject({ statusCode: 502 })
  })
})
