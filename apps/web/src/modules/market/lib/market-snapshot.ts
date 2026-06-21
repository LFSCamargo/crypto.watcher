import type { MarketSnapshot, PricePoint } from './market.types'
import { MARKET_STALE_TIME_MS } from './market.types'
import { computePercentChange, DAY_MS } from './market-changes'

function buildChartHistory(prices: [number, number][]): PricePoint[] {
  return prices.map(([timestamp, price]) => ({ timestamp, price }))
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

  const expiresAt = new Date(cachedAt.getTime() + MARKET_STALE_TIME_MS)

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
