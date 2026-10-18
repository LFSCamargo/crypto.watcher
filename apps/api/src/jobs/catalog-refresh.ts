import { logger } from '../core/logger'
import { MARKET_CACHE_TTL_MS } from '../modules/market/market.cache'
import { marketRepository } from '../modules/market/market.repository'
import { marketService } from '../modules/market/market.service'
import { resolveMetricsTargets } from '../modules/protocol-metrics/metrics-target'
import { protocolMetricsRepository } from '../modules/protocol-metrics/protocol-metrics.repository'
import { protocolMetricsService } from '../modules/protocol-metrics/protocol-metrics.service'
import { CATALOG_SLUGS } from './catalog-slugs'

export const CATALOG_REFRESH_INTERVAL_MS = MARKET_CACHE_TTL_MS

/** Pause after a CoinGecko chart fetch so the free tier is not rate-limited. */
export const MARKET_REFRESH_GAP_MS = 1_500

/** Pause after a DeFi Llama fetch. Skipped rows do not wait. */
export const PROTOCOL_REFRESH_GAP_MS = 400

export type RefreshOutcome = 'fresh' | 'updated' | 'failed'

export interface RefreshTotals {
  fresh: number
  updated: number
  failed: number
}

const emptyTotals = (): RefreshTotals => ({ fresh: 0, updated: 0, failed: 0 })

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function refreshOne(
  slug: string,
  isFresh: (slug: string) => Promise<boolean>,
  load: (slug: string) => Promise<{ stale?: boolean }>,
): Promise<RefreshOutcome> {
  if (await isFresh(slug)) return 'fresh'
  const snapshot = await load(slug)
  return snapshot.stale ? 'failed' : 'updated'
}

/**
 * Walks slugs one at a time. A gap runs only after an upstream fetch.
 * O(n) freshness checks, then O(k) network calls for the stale subset.
 */
export async function refreshCatalogPaced(
  slugs: readonly string[],
  load: (slug: string) => Promise<RefreshOutcome>,
  gapMs: number,
  wait: (ms: number) => Promise<void> = sleep,
): Promise<RefreshTotals> {
  const totals = emptyTotals()

  for (const slug of slugs) {
    let outcome: RefreshOutcome
    try {
      outcome = await load(slug)
    } catch {
      outcome = 'failed'
    }
    totals[outcome] += 1
    if (outcome === 'updated' && gapMs > 0) await wait(gapMs)
  }

  return totals
}

export async function refreshMarketSlug(slug: string): Promise<RefreshOutcome> {
  return refreshOne(
    slug,
    (item) => marketRepository.getFresh(item).then(Boolean),
    (item) => marketService.getProjectMarket(item),
  )
}

export async function refreshProtocolMetricsSlug(slug: string): Promise<RefreshOutcome> {
  if (resolveMetricsTargets(slug).length === 0) return 'fresh'
  return refreshOne(
    slug,
    (item) => protocolMetricsRepository.getFresh(item).then(Boolean),
    (item) => protocolMetricsService.getProjectProtocolMetrics(item),
  )
}

export async function runCatalogRefresh(): Promise<void> {
  logger.info({ slugs: CATALOG_SLUGS.length }, 'catalog refresh started')

  const markets = await refreshCatalogPaced(
    CATALOG_SLUGS,
    refreshMarketSlug,
    MARKET_REFRESH_GAP_MS,
  )
  logger.info(markets, 'market catalog refresh finished')

  const metrics = await refreshCatalogPaced(
    CATALOG_SLUGS,
    refreshProtocolMetricsSlug,
    PROTOCOL_REFRESH_GAP_MS,
  )
  logger.info(metrics, 'protocol metrics catalog refresh finished')
}

export function startCatalogRefresh(
  run: () => Promise<void> = runCatalogRefresh,
  intervalMs = CATALOG_REFRESH_INTERVAL_MS,
): () => void {
  let running = false

  const safeRun = () => {
    if (running) return
    running = true
    void run()
      .catch((error: unknown) => {
        logger.error({ err: error }, 'catalog refresh failed')
      })
      .finally(() => {
        running = false
      })
  }

  safeRun()
  const timer = setInterval(safeRun, intervalMs)
  timer.unref()
  return () => clearInterval(timer)
}
