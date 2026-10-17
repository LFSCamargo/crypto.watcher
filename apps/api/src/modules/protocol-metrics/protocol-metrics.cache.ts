/** Refresh interval. A passed expiry means "fetch again", not "delete the snapshot". */
export const PROTOCOL_METRICS_CACHE_TTL_MS = 12 * 60 * 60 * 1000

/** Keep the last successful snapshot this long so an outage can still render it. */
export const PROTOCOL_METRICS_RETENTION_MS = 7 * 24 * 60 * 60 * 1000

export function isWithinProtocolMetricsRetention(cachedAt: string, now = Date.now()): boolean {
  const fetchedAt = Date.parse(cachedAt)
  return Number.isFinite(fetchedAt) && now - fetchedAt <= PROTOCOL_METRICS_RETENTION_MS
}

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

export class ProtocolMetricsCache<T> {
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

  set(key: string, data: T, ttlMs = PROTOCOL_METRICS_CACHE_TTL_MS): void {
    this.entries.set(key, { data, expiresAt: Date.now() + ttlMs })
  }

  clear(): void {
    this.entries.clear()
  }
}
