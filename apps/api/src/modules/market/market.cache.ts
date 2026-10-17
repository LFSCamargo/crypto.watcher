/** Refresh interval. A passed expiry means "fetch again", not "delete the snapshot". */
export const MARKET_CACHE_TTL_MS = 12 * 60 * 60 * 1000

/** Keep the last successful snapshot this long so an outage can still render it. */
export const MARKET_RETENTION_MS = 7 * 24 * 60 * 60 * 1000

export function isWithinMarketRetention(cachedAt: string, now = Date.now()): boolean {
  const fetchedAt = Date.parse(cachedAt)
  return Number.isFinite(fetchedAt) && now - fetchedAt <= MARKET_RETENTION_MS
}

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

export class MarketCache<T> {
  private entries = new Map<string, CacheEntry<T>>()

  get(key: string): T | null {
    const entry = this.entries.get(key)
    if (!entry) return null
    if (Date.now() >= entry.expiresAt) {
      this.entries.delete(key)
      return null
    }
    return entry.data
  }

  set(key: string, data: T, ttlMs = MARKET_CACHE_TTL_MS): void {
    this.entries.set(key, { data, expiresAt: Date.now() + ttlMs })
  }

  clear(): void {
    this.entries.clear()
  }
}
