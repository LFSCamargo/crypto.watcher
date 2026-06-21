export const MARKET_CACHE_TTL_MS = 3 * 60 * 60 * 1000

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
