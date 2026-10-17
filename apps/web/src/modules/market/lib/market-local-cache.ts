import { MARKET_RETENTION_MS, type MarketSnapshot, type PricePoint } from './market.types'

const CACHE_PREFIX = 'cw.market.v4:'
const INDEX_KEY = 'cw.market.index.v4'
const LEGACY_PREFIX = 'cw.market.v3:'

/** Enough points for a sparkline and a first paint of the chart. */
export const MARKET_HYDRATION_POINTS = 48

/** One compact snapshot per reference asset, so leaving and reloading does not drop prices. */
export const MARKET_CACHE_LIMIT = 100

let legacyDropped = false

function cacheKey(slug: string): string {
  return `${CACHE_PREFIX}${slug}`
}

function downsampleHistory(history: PricePoint[]): PricePoint[] {
  if (history.length <= MARKET_HYDRATION_POINTS) return history

  const lastIndex = MARKET_HYDRATION_POINTS - 1
  const sampled: PricePoint[] = []
  for (let index = 0; index < MARKET_HYDRATION_POINTS; index += 1) {
    const sourceIndex = Math.round((index * (history.length - 1)) / lastIndex)
    const point = history[sourceIndex]
    if (point) sampled.push(point)
  }
  return sampled
}

function readIndex(): string[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((slug): slug is string => typeof slug === 'string')
  } catch {
    return []
  }
}

function dropLegacyEntries(): void {
  if (legacyDropped) return
  legacyDropped = true

  const legacyKeys: string[] = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (key?.startsWith(LEGACY_PREFIX)) legacyKeys.push(key)
  }
  for (const key of legacyKeys) localStorage.removeItem(key)
}

function rememberSlug(slug: string): void {
  const previous = readIndex()
  const next = [slug, ...previous.filter((item) => item !== slug)].slice(0, MARKET_CACHE_LIMIT)
  for (const dropped of previous) {
    if (!next.includes(dropped)) localStorage.removeItem(cacheKey(dropped))
  }
  localStorage.setItem(INDEX_KEY, JSON.stringify(next))
}

export function readLocalMarketCache(slug: string): MarketSnapshot | null {
  try {
    const raw = localStorage.getItem(cacheKey(slug))
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      localStorage.removeItem(cacheKey(slug))
      return null
    }

    const snapshot = parsed as MarketSnapshot
    if (typeof snapshot.slug !== 'string' || typeof snapshot.price !== 'number') {
      localStorage.removeItem(cacheKey(slug))
      return null
    }
    if (!Array.isArray(snapshot.history) || snapshot.history.length === 0) {
      localStorage.removeItem(cacheKey(slug))
      return null
    }

    const cachedAt = Date.parse(snapshot.cachedAt)
    if (!Number.isFinite(cachedAt) || Date.now() - cachedAt > MARKET_RETENTION_MS) {
      localStorage.removeItem(cacheKey(slug))
      return null
    }

    const expired = Date.now() >= Date.parse(snapshot.expiresAt)
    return expired ? { ...snapshot, stale: true } : snapshot
  } catch {
    return null
  }
}

export function writeLocalMarketCache(slug: string, snapshot: MarketSnapshot): void {
  const compact: MarketSnapshot = {
    ...snapshot,
    history: downsampleHistory(snapshot.history),
  }
  const payload = JSON.stringify(compact)

  try {
    dropLegacyEntries()
    rememberSlug(slug)
    localStorage.setItem(cacheKey(slug), payload)
  } catch {
    try {
      const oldest = readIndex().filter((item) => item !== slug).at(-1)
      if (oldest) localStorage.removeItem(cacheKey(oldest))
      rememberSlug(slug)
      localStorage.setItem(cacheKey(slug), payload)
    } catch {
      // Ignore quota and private-mode failures. The network snapshot still renders.
    }
  }
}
