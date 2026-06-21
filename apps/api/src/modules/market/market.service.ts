import { HttpError } from '../../core/http/validation'
import { resolveCoingeckoId } from './coingecko-ids'
import { MARKET_CACHE_TTL_MS, MarketCache } from './market.cache'
import { computePercentChange, DAY_MS } from './market-changes'
import { marketRepository, type MarketRepository } from './market.repository'
import type { MarketSnapshot } from './market.types'

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3'
const MARKET_HISTORY_DAYS = 365

type CoinGeckoMarketChart = {
  prices: [number, number][]
}

export function findClosestPrice(
  prices: [number, number][],
  targetTimestamp: number,
): number | null {
  if (prices.length === 0) return null

  let closest = prices[0]!
  let closestDistance = Math.abs(closest[0] - targetTimestamp)

  for (const point of prices) {
    const distance = Math.abs(point[0] - targetTimestamp)
    if (distance < closestDistance) {
      closest = point
      closestDistance = distance
    }
  }

  return closest[1]
}

function buildChartHistory(prices: [number, number][]): MarketSnapshot['history'] {
  return prices.map(([timestamp, price]) => ({ timestamp, price }))
}

export function buildMarketSnapshot(
  slug: string,
  coingeckoId: string,
  prices: [number, number][],
  cachedAt = new Date(),
): MarketSnapshot {
  const current = prices.at(-1)?.[1] ?? 0
  const lastTimestamp = prices.at(-1)?.[0] ?? cachedAt.getTime()
  const history = buildChartHistory(prices)

  const change24h = computePercentChange(
    current,
    findClosestPrice(prices, lastTimestamp - DAY_MS),
  )
  const change7d = computePercentChange(
    current,
    findClosestPrice(prices, lastTimestamp - 7 * DAY_MS),
  )
  const change1m = computePercentChange(
    current,
    findClosestPrice(prices, lastTimestamp - 30 * DAY_MS),
  )
  const change1y = computePercentChange(
    current,
    findClosestPrice(prices, lastTimestamp - 365 * DAY_MS),
  )

  const expiresAt = new Date(cachedAt.getTime() + MARKET_CACHE_TTL_MS)

  return {
    slug,
    coingeckoId,
    currency: 'usd',
    price: current,
    change24h,
    change7d,
    change1m,
    change1y,
    history,
    cachedAt: cachedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }
}

function memoryCacheKey(slug: string): string {
  return `project:v3:${slug}`
}

export class MarketService {
  private memory = new MarketCache<MarketSnapshot>()

  constructor(
    private fetchImpl: typeof fetch = fetch,
    private repository: MarketRepository = marketRepository,
  ) {}

  clearCache(): void {
    this.memory.clear()
  }

  private remember(slug: string, snapshot: MarketSnapshot): MarketSnapshot {
    this.memory.set(memoryCacheKey(slug), snapshot)
    return snapshot
  }

  private async fetchFromCoinGecko(slug: string, coingeckoId: string): Promise<MarketSnapshot> {
    const url = `${COINGECKO_BASE_URL}/coins/${encodeURIComponent(coingeckoId)}/market_chart?vs_currency=usd&days=${MARKET_HISTORY_DAYS}`
    const response = await this.fetchImpl(url, {
      headers: { Accept: 'application/json' },
    })

    if (response.status === 404) {
      throw new HttpError(404, 'Price data is not available for this project')
    }

    if (!response.ok) {
      throw new HttpError(502, 'Unable to fetch market data right now')
    }

    const payload = (await response.json()) as CoinGeckoMarketChart
    if (!Array.isArray(payload.prices) || payload.prices.length === 0) {
      throw new HttpError(404, 'Price data is not available for this project')
    }

    return buildMarketSnapshot(slug, coingeckoId, payload.prices)
  }

  async getProjectMarket(slug: string): Promise<MarketSnapshot> {
    const coingeckoId = resolveCoingeckoId(slug)
    if (!coingeckoId) {
      throw new HttpError(404, 'Price data is not available for this project')
    }

    const cachedInMemory = this.memory.get(memoryCacheKey(slug))
    if (cachedInMemory) return cachedInMemory

    const freshInDb = await this.repository.getFresh(slug)
    if (freshInDb) return this.remember(slug, freshInDb)

    try {
      const snapshot = await this.fetchFromCoinGecko(slug, coingeckoId)
      await this.repository.upsert(slug, coingeckoId, snapshot)
      return this.remember(slug, snapshot)
    } catch (error) {
      const staleInDb = await this.repository.getAny(slug)
      if (staleInDb) {
        return this.remember(slug, { ...staleInDb, stale: true })
      }

      if (error instanceof HttpError) throw error
      throw new HttpError(502, 'Unable to fetch market data right now')
    }
  }
}

export const marketService = new MarketService()
