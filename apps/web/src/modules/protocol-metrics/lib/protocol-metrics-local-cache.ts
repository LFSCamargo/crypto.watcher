import {
  PROTOCOL_METRICS_RETENTION_MS,
  PROTOCOL_METRICS_SNAPSHOT_VERSION,
  type ProtocolMetricsSnapshot,
  type TimeSeriesPoint,
  type TvlPoint,
} from './protocol-metrics.types'

const CACHE_PREFIX = 'cw.protocol-metrics.v2:'
const INDEX_KEY = 'cw.protocol-metrics.index.v2'
const LEGACY_PREFIX = 'cw.protocol-metrics.v1:'
const LEGACY_INDEX_KEY = 'cw.protocol-metrics.index.v1'

let legacyDropped = false

function dropLegacyEntries(): void {
  if (legacyDropped) return
  legacyDropped = true
  localStorage.removeItem(LEGACY_INDEX_KEY)
  const legacyKeys: string[] = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (key?.startsWith(LEGACY_PREFIX)) legacyKeys.push(key)
  }
  for (const key of legacyKeys) localStorage.removeItem(key)
}

/** One year of daily points is enough for the TVL, fees, and revenue ranges. */
const HISTORY_LIMIT = 366

/** Home ticker plus recently opened assessments. Each snapshot stays under its own slug. */
export const PROTOCOL_METRICS_CACHE_LIMIT = 48

function cacheKey(slug: string): string {
  return `${CACHE_PREFIX}${slug}`
}

function trimHistory<T extends { timestamp: number }>(history: T[] | undefined): T[] {
  if (!history) return []
  return history.length > HISTORY_LIMIT ? history.slice(history.length - HISTORY_LIMIT) : history
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

function rememberSlug(slug: string): void {
  const previous = readIndex()
  const next = [slug, ...previous.filter((item) => item !== slug)].slice(
    0,
    PROTOCOL_METRICS_CACHE_LIMIT,
  )
  for (const dropped of previous) {
    if (!next.includes(dropped)) localStorage.removeItem(cacheKey(dropped))
  }
  localStorage.setItem(INDEX_KEY, JSON.stringify(next))
}

function compactSnapshot(snapshot: ProtocolMetricsSnapshot): ProtocolMetricsSnapshot {
  return {
    ...snapshot,
    chains: snapshot.chains.slice(0, 12),
    tvlHistory: trimHistory<TvlPoint>(snapshot.tvlHistory),
    chainBreakdown: snapshot.chainBreakdown.slice(0, 12),
    tokenComposition: snapshot.tokenComposition.slice(0, 12),
    feesHistory: trimHistory<TimeSeriesPoint>(snapshot.feesHistory),
    revenueHistory: trimHistory<TimeSeriesPoint>(snapshot.revenueHistory),
    dexVolumeHistory: trimHistory<TimeSeriesPoint>(snapshot.dexVolumeHistory),
    exploits: snapshot.exploits.slice(0, 5),
  }
}

export function readProtocolMetricsCache(slug: string): ProtocolMetricsSnapshot | null {
  dropLegacyEntries()
  try {
    const raw = localStorage.getItem(cacheKey(slug))
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      localStorage.removeItem(cacheKey(slug))
      return null
    }

    const snapshot = parsed as ProtocolMetricsSnapshot
    if (typeof snapshot.slug !== 'string' || typeof snapshot.tvl !== 'number') {
      localStorage.removeItem(cacheKey(slug))
      return null
    }
    if (!Array.isArray(snapshot.tvlHistory)) {
      localStorage.removeItem(cacheKey(slug))
      return null
    }
    if (snapshot.snapshotVersion !== PROTOCOL_METRICS_SNAPSHOT_VERSION) {
      localStorage.removeItem(cacheKey(slug))
      return null
    }

    const cachedAt = Date.parse(snapshot.cachedAt)
    if (!Number.isFinite(cachedAt) || Date.now() - cachedAt > PROTOCOL_METRICS_RETENTION_MS) {
      localStorage.removeItem(cacheKey(slug))
      return null
    }

    const expired = Date.now() >= Date.parse(snapshot.expiresAt)
    return expired ? { ...snapshot, stale: true } : snapshot
  } catch {
    return null
  }
}

export function writeProtocolMetricsCache(slug: string, snapshot: ProtocolMetricsSnapshot): void {
  dropLegacyEntries()
  const payload = JSON.stringify(compactSnapshot(snapshot))

  try {
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
