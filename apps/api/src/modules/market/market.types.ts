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
