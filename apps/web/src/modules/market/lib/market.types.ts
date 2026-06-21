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

export const MARKET_STALE_TIME_MS = 3 * 60 * 60 * 1000
