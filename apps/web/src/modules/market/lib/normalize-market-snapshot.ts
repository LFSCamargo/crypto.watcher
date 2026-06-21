import type { MarketSnapshot } from './market.types'
import { MARKET_STALE_TIME_MS } from './market.types'

function toNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function normalizeMarketSnapshot(raw: unknown): MarketSnapshot | null {
  if (!raw || typeof raw !== 'object') return null

  const snapshot = raw as Partial<MarketSnapshot>
  const price = toNullableNumber(snapshot.price)
  if (price === null || typeof snapshot.slug !== 'string') return null
  if (!Array.isArray(snapshot.history)) return null

  const history = snapshot.history
    .filter(
      (point): point is MarketSnapshot['history'][number] =>
        Boolean(point) &&
        typeof point.timestamp === 'number' &&
        Number.isFinite(point.timestamp) &&
        typeof point.price === 'number' &&
        Number.isFinite(point.price),
    )
    .map((point) => ({ timestamp: point.timestamp, price: point.price }))

  if (history.length === 0) return null

  const cachedAt =
    typeof snapshot.cachedAt === 'string' ? snapshot.cachedAt : new Date().toISOString()
  const expiresAt =
    typeof snapshot.expiresAt === 'string'
      ? snapshot.expiresAt
      : new Date(Date.now() + MARKET_STALE_TIME_MS).toISOString()

  return {
    slug: snapshot.slug,
    coingeckoId: typeof snapshot.coingeckoId === 'string' ? snapshot.coingeckoId : snapshot.slug,
    currency: 'usd',
    price,
    change24h: toNullableNumber(snapshot.change24h),
    change7d: toNullableNumber(snapshot.change7d),
    change1m: toNullableNumber(snapshot.change1m),
    change1y: toNullableNumber(snapshot.change1y),
    history,
    cachedAt,
    expiresAt,
    stale: snapshot.stale === true ? true : undefined,
  }
}
