export interface PricePoint {
  timestamp: number
  price: number
}

export interface MarketSnapshot {
  slug: string
  coingeckoId: string
  currency: 'usd'
  price: number
  change24h: number | null
  change7d: number | null
  change1m: number | null
  change1y: number | null
  history: PricePoint[]
  cachedAt: string
  expiresAt: string
  stale?: boolean
}

/** When to fetch again and replace the snapshot. Passing this time does not delete it. */
export const MARKET_REFRESH_MS = 12 * 60 * 60 * 1000

/** Show the last saved snapshot through an outage, then allow an error after this. */
export const MARKET_RETENTION_MS = 7 * 24 * 60 * 60 * 1000

export const MARKET_STALE_TIME_MS = MARKET_REFRESH_MS
