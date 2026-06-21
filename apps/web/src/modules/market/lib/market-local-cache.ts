import type { MarketSnapshot } from './market.types'
import { MARKET_STALE_TIME_MS } from './market.types'
import { normalizeMarketSnapshot } from './normalize-market-snapshot'

const CACHE_PREFIX = 'cw.market.v3:'

export function readLocalMarketCache(slug: string): MarketSnapshot | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${slug}`)
    if (!raw) return null

    const snapshot = normalizeMarketSnapshot(JSON.parse(raw))
    if (!snapshot) {
      localStorage.removeItem(`${CACHE_PREFIX}${slug}`)
      return null
    }

    if (Date.now() >= Date.parse(snapshot.expiresAt)) {
      localStorage.removeItem(`${CACHE_PREFIX}${slug}`)
      return null
    }

    return snapshot
  } catch {
    return null
  }
}

export function writeLocalMarketCache(slug: string, snapshot: MarketSnapshot): void {
  try {
    const expiresAt = new Date(Date.now() + MARKET_STALE_TIME_MS).toISOString()
    localStorage.setItem(`${CACHE_PREFIX}${slug}`, JSON.stringify({ ...snapshot, expiresAt }))
  } catch {
    // Ignore quota / private mode errors.
  }
}
