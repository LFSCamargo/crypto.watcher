import { HttpError } from '../../core/http/validation'
import {
  metricsTargetKey,
  resolveMetricsTargets,
  type MetricsTarget,
} from './metrics-target'
import {
  computePercentChange,
  DAY_MS,
  findClosestTvl,
} from './protocol-metrics-changes'
import {
  aggregateTvlHistoryFromChains,
  extractChainBreakdown,
  extractStablecoinChainBreakdown,
  extractTokenComposition,
  normalizeChainTvlHistory,
  normalizeChartHistory,
  normalizeStablecoinHistory,
  normalizeTvlHistory,
  sumChainTvls,
  toMs,
} from './protocol-metrics-extractors'
import { PROTOCOL_METRICS_CACHE_TTL_MS, ProtocolMetricsCache } from './protocol-metrics.cache'
import {
  protocolMetricsRepository,
  type ProtocolMetricsRepository,
} from './protocol-metrics.repository'
import type { ExploitRecord, ProtocolMetricsSnapshot } from './protocol-metrics.types'
import { PROTOCOL_METRICS_SNAPSHOT_VERSION } from './protocol-metrics.types'
import { computeProtocolValuation } from './protocol-valuation'

const DEFILLAMA_BASE_URL = 'https://api.llama.fi'
const DEFILLAMA_STABLECOINS_URL = 'https://stablecoins.llama.fi'

type DefiLlamaTvlPoint = {
  date: number
  totalLiquidityUSD: number
}

type DefiLlamaHack = {
  date: number
  name: string
  classification?: string
  amount?: number
  chain?: string[]
  returnedFunds?: number | null
}

type DefiLlamaProtocol = {
  id: string
  name: string
  category?: string
  url?: string
  chains?: string[]
  mcap?: number
  tvl?: DefiLlamaTvlPoint[]
  chainTvls?: Record<string, { tvl?: DefiLlamaTvlPoint[] }>
  currentChainTvls?: Record<string, number>
  tokensInUsd?: unknown
  hacks?: DefiLlamaHack[]
}

type DefiLlamaFeesSummary = {
  total24h?: number
  total7d?: number
  total30d?: number
  change_1d?: number
  totalDataChart?: [number, number][]
}

type DefiLlamaDexSummary = DefiLlamaFeesSummary

function emptyDexVolume() {
  return {
    dexVolume24h: null,
    dexVolume7d: null,
    dexVolume30d: null,
    dexVolumeChange1d: null,
    dexVolumeHistory: [],
  }
}

function extractDexVolume(dex: DefiLlamaDexSummary | null) {
  if (!dex) return emptyDexVolume()

  return {
    dexVolume24h: dex.total24h ?? null,
    dexVolume7d: dex.total7d ?? null,
    dexVolume30d: dex.total30d ?? null,
    dexVolumeChange1d: dex.change_1d ?? null,
    dexVolumeHistory: normalizeChartHistory(dex.totalDataChart),
  }
}

type DefiLlamaChainTvlPoint = {
  date: number
  tvl: number
}

type DefiLlamaStablecoin = {
  id: string
  name: string
  symbol?: string
  url?: string
  pegMechanism?: string
  price?: number
  currentChainBalances?: Record<string, { peggedUSD?: number }>
  tokens?: { date: number; circulating?: { peggedUSD?: number } }[]
}

function formatStablecoinCategory(pegMechanism: string | undefined): string {
  if (!pegMechanism) return 'Stablecoin'
  const label = pegMechanism
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-')
  return `${label} stablecoin`
}

function normalizeExploits(raw: DefiLlamaHack[] | undefined): ExploitRecord[] {
  if (!Array.isArray(raw)) return []

  return raw.map((hack) => ({
    date: new Date(toMs(hack.date)).toISOString(),
    name: hack.name,
    classification: hack.classification ?? null,
    amountUsd: typeof hack.amount === 'number' ? hack.amount : null,
    chain: Array.isArray(hack.chain) ? hack.chain : [],
    returnedFunds: typeof hack.returnedFunds === 'number' ? hack.returnedFunds : null,
  }))
}

function sumExploitLoss(exploits: ExploitRecord[]): number | null {
  const amounts = exploits
    .map((exploit) => exploit.amountUsd)
    .filter((amount): amount is number => amount != null && Number.isFinite(amount))

  if (amounts.length === 0) return null
  return amounts.reduce((total, amount) => total + amount, 0)
}

function resolveTvlHistory(protocol: DefiLlamaProtocol) {
  const fromRoot = normalizeTvlHistory(protocol.tvl)
  if (fromRoot.length > 0) return fromRoot
  return aggregateTvlHistoryFromChains(protocol.chainTvls)
}

function attachValuation(
  snapshot: Omit<ProtocolMetricsSnapshot, 'valuation'>,
): ProtocolMetricsSnapshot {
  const valuation = computeProtocolValuation({
    entityType: snapshot.entityType,
    tvl: snapshot.tvl,
    mcap: snapshot.mcap,
    fees30d: snapshot.fees30d,
    revenue30d: snapshot.revenue30d,
    feesHistory: snapshot.feesHistory,
    revenueHistory: snapshot.revenueHistory,
    chainBreakdown: snapshot.chainBreakdown,
    chainCount: snapshot.chains.length,
    exploitCount: snapshot.exploitCount,
    totalExploitLossUsd: snapshot.totalExploitLossUsd,
  })

  return { ...snapshot, valuation }
}

function emptyFinancials() {
  return {
    fees24h: null,
    fees7d: null,
    fees30d: null,
    feesChange1d: null,
    feesHistory: [],
    revenue24h: null,
    revenue7d: null,
    revenue30d: null,
    revenueHistory: [],
    ...emptyDexVolume(),
    chainBreakdown: [],
    tokenComposition: [],
    exploits: [],
    exploitCount: 0,
    totalExploitLossUsd: null,
  }
}

function buildTvlTrends(tvlHistory: { timestamp: number; tvl: number }[], cachedAt: Date) {
  const currentTvl = tvlHistory.at(-1)?.tvl ?? 0
  const lastTimestamp = tvlHistory.at(-1)?.timestamp ?? cachedAt.getTime()

  return {
    tvl: currentTvl,
    tvlChange24h: computePercentChange(
      currentTvl,
      findClosestTvl(tvlHistory, lastTimestamp - DAY_MS),
    ),
    tvlChange7d: computePercentChange(
      currentTvl,
      findClosestTvl(tvlHistory, lastTimestamp - 7 * DAY_MS),
    ),
    tvlChange30d: computePercentChange(
      currentTvl,
      findClosestTvl(tvlHistory, lastTimestamp - 30 * DAY_MS),
    ),
    tvlHistory,
  }
}

export function buildStablecoinMetricsSnapshot(
  slug: string,
  stablecoinId: string,
  stablecoin: DefiLlamaStablecoin,
  cachedAt = new Date(),
): ProtocolMetricsSnapshot | null {
  const tvlHistory = normalizeStablecoinHistory(stablecoin.tokens)
  const chainBreakdown = extractStablecoinChainBreakdown(stablecoin.currentChainBalances)
  const hasSupply = tvlHistory.length > 0 || chainBreakdown.length > 0
  if (!hasSupply) return null

  const trends = buildTvlTrends(tvlHistory, cachedAt)
  const expiresAt = new Date(cachedAt.getTime() + PROTOCOL_METRICS_CACHE_TTL_MS)

  return attachValuation({
    slug,
    entityType: 'stablecoin',
    defillamaId: metricsTargetKey({ type: 'stablecoin', id: stablecoinId }),
    name: stablecoin.name,
    category: formatStablecoinCategory(stablecoin.pegMechanism),
    website: stablecoin.url ?? null,
    chains: chainBreakdown.map((item) => item.chain),
    mcap: null,
    ...trends,
    ...emptyFinancials(),
    chainBreakdown,
    snapshotVersion: PROTOCOL_METRICS_SNAPSHOT_VERSION,
    cachedAt: cachedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  })
}

export function buildChainMetricsSnapshot(
  slug: string,
  chainId: string,
  history: DefiLlamaChainTvlPoint[],
  dex: DefiLlamaDexSummary | null = null,
  fees: DefiLlamaFeesSummary | null = null,
  cachedAt = new Date(),
): ProtocolMetricsSnapshot | null {
  const tvlHistory = normalizeChainTvlHistory(history)
  if (tvlHistory.length === 0) return null

  const trends = buildTvlTrends(tvlHistory, cachedAt)
  const expiresAt = new Date(cachedAt.getTime() + PROTOCOL_METRICS_CACHE_TTL_MS)

  return attachValuation({
    slug,
    entityType: 'chain',
    defillamaId: metricsTargetKey({ type: 'chain', id: chainId }),
    name: chainId,
    category: 'Chain',
    website: null,
    chains: [chainId],
    mcap: null,
    ...trends,
    ...emptyFinancials(),
    ...extractDexVolume(dex),
    fees24h: fees?.total24h ?? null,
    fees7d: fees?.total7d ?? null,
    fees30d: fees?.total30d ?? null,
    feesChange1d: fees?.change_1d ?? null,
    feesHistory: normalizeChartHistory(fees?.totalDataChart),
    snapshotVersion: PROTOCOL_METRICS_SNAPSHOT_VERSION,
    cachedAt: cachedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  })
}

export function buildProtocolMetricsSnapshot(
  slug: string,
  defillamaId: string,
  protocol: DefiLlamaProtocol,
  fees: DefiLlamaFeesSummary | null,
  revenue: DefiLlamaFeesSummary | null,
  dex: DefiLlamaDexSummary | null = null,
  cachedAt = new Date(),
): ProtocolMetricsSnapshot | null {
  const tvlHistory = resolveTvlHistory(protocol)
  const hasTvl = tvlHistory.length > 0 || sumChainTvls(protocol.currentChainTvls) > 0
  if (!hasTvl) return null

  const trends = buildTvlTrends(tvlHistory, cachedAt)
  const exploits = normalizeExploits(protocol.hacks)
  const expiresAt = new Date(cachedAt.getTime() + PROTOCOL_METRICS_CACHE_TTL_MS)

  return attachValuation({
    slug,
    entityType: 'protocol',
    defillamaId: metricsTargetKey({ type: 'protocol', id: defillamaId }),
    name: protocol.name,
    category: protocol.category ?? null,
    website: protocol.url ?? null,
    chains: protocol.chains ?? [],
    mcap: typeof protocol.mcap === 'number' ? protocol.mcap : null,
    ...trends,
    chainBreakdown: extractChainBreakdown(protocol.currentChainTvls),
    tokenComposition: extractTokenComposition(protocol.tokensInUsd),
    fees24h: fees?.total24h ?? null,
    fees7d: fees?.total7d ?? null,
    fees30d: fees?.total30d ?? null,
    feesChange1d: fees?.change_1d ?? null,
    feesHistory: normalizeChartHistory(fees?.totalDataChart),
    revenue24h: revenue?.total24h ?? null,
    revenue7d: revenue?.total7d ?? null,
    revenue30d: revenue?.total30d ?? null,
    revenueHistory: normalizeChartHistory(revenue?.totalDataChart),
    ...extractDexVolume(dex),
    exploits,
    exploitCount: exploits.length,
    totalExploitLossUsd: sumExploitLoss(exploits),
    snapshotVersion: PROTOCOL_METRICS_SNAPSHOT_VERSION,
    cachedAt: cachedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  })
}

function memoryCacheKey(slug: string): string {
  return `protocol-metrics:v6:${slug}`
}

async function fetchJsonSafe<T>(fetchImpl: typeof fetch, url: string): Promise<T | null> {
  try {
    const response = await fetchImpl(url, {
      headers: { Accept: 'application/json' },
    })

    if (response.status === 404) return null
    if (!response.ok) return null

    return (await response.json()) as T
  } catch {
    return null
  }
}

async function fetchProtocol(
  fetchImpl: typeof fetch,
  protocolId: string,
): Promise<DefiLlamaProtocol | null> {
  const url = `${DEFILLAMA_BASE_URL}/protocol/${encodeURIComponent(protocolId)}`
  return fetchJsonSafe<DefiLlamaProtocol>(fetchImpl, url)
}

async function fetchChainDexOverview(
  fetchImpl: typeof fetch,
  chainId: string,
): Promise<DefiLlamaDexSummary | null> {
  const url = `${DEFILLAMA_BASE_URL}/overview/dexs/${encodeURIComponent(chainId)}?dataType=dailyVolume`
  return fetchJsonSafe<DefiLlamaDexSummary>(fetchImpl, url)
}

async function fetchChainFeesOverview(
  fetchImpl: typeof fetch,
  chainId: string,
): Promise<DefiLlamaFeesSummary | null> {
  const url = `${DEFILLAMA_BASE_URL}/overview/fees/${encodeURIComponent(chainId)}?dataType=dailyFees`
  return fetchJsonSafe<DefiLlamaFeesSummary>(fetchImpl, url)
}

async function fetchProtocolDexSummary(
  fetchImpl: typeof fetch,
  protocolId: string,
): Promise<DefiLlamaDexSummary | null> {
  const url = `${DEFILLAMA_BASE_URL}/summary/dexs/${encodeURIComponent(protocolId)}?dataType=dailyVolume`
  return fetchJsonSafe<DefiLlamaDexSummary>(fetchImpl, url)
}

async function fetchStablecoin(
  fetchImpl: typeof fetch,
  stablecoinId: string,
): Promise<DefiLlamaStablecoin | null> {
  const url = `${DEFILLAMA_STABLECOINS_URL}/stablecoin/${encodeURIComponent(stablecoinId)}`
  return fetchJsonSafe<DefiLlamaStablecoin>(fetchImpl, url)
}

async function fetchChainHistory(
  fetchImpl: typeof fetch,
  chainId: string,
): Promise<DefiLlamaChainTvlPoint[] | null> {
  const url = `${DEFILLAMA_BASE_URL}/v2/historicalChainTvl/${encodeURIComponent(chainId)}`
  return fetchJsonSafe<DefiLlamaChainTvlPoint[]>(fetchImpl, url)
}

export class ProtocolMetricsService {
  private memory = new ProtocolMetricsCache<ProtocolMetricsSnapshot>()

  constructor(
    private fetchImpl: typeof fetch = fetch,
    private repository: ProtocolMetricsRepository = protocolMetricsRepository,
  ) {}

  clearCache(): void {
    this.memory.clear()
  }

  private enrichSnapshot(snapshot: ProtocolMetricsSnapshot): ProtocolMetricsSnapshot {
    const { valuation: _ignored, ...rest } = snapshot
    return attachValuation(rest)
  }

  private remember(slug: string, snapshot: ProtocolMetricsSnapshot): ProtocolMetricsSnapshot {
    const enriched = this.enrichSnapshot(snapshot)
    this.memory.set(memoryCacheKey(slug), enriched)
    return enriched
  }

  private async fetchTargetSnapshot(
    slug: string,
    target: MetricsTarget,
  ): Promise<ProtocolMetricsSnapshot | null> {
    if (target.type === 'stablecoin') {
      const stablecoin = await fetchStablecoin(this.fetchImpl, target.id)
      if (!stablecoin) return null
      return buildStablecoinMetricsSnapshot(slug, target.id, stablecoin)
    }

    if (target.type === 'chain') {
      const [history, dex, fees] = await Promise.all([
        fetchChainHistory(this.fetchImpl, target.id),
        fetchChainDexOverview(this.fetchImpl, target.id),
        fetchChainFeesOverview(this.fetchImpl, target.id),
      ])
      if (!history || history.length === 0) return null
      return buildChainMetricsSnapshot(slug, target.id, history, dex, fees)
    }

    const feesUrl = `${DEFILLAMA_BASE_URL}/summary/fees/${encodeURIComponent(target.id)}?dataType=dailyFees`
    const revenueUrl = `${DEFILLAMA_BASE_URL}/summary/fees/${encodeURIComponent(target.id)}?dataType=dailyRevenue`

    const [protocol, fees, revenue, dex] = await Promise.all([
      fetchProtocol(this.fetchImpl, target.id),
      fetchJsonSafe<DefiLlamaFeesSummary>(this.fetchImpl, feesUrl),
      fetchJsonSafe<DefiLlamaFeesSummary>(this.fetchImpl, revenueUrl),
      fetchProtocolDexSummary(this.fetchImpl, target.id),
    ])

    if (!protocol) return null
    return buildProtocolMetricsSnapshot(slug, target.id, protocol, fees, revenue, dex)
  }

  private async fetchFromDefiLlama(slug: string): Promise<ProtocolMetricsSnapshot> {
    const targets = resolveMetricsTargets(slug)
    if (targets.length === 0) {
      throw new HttpError(404, 'Protocol metrics are not available for this project')
    }

    for (const target of targets) {
      const snapshot = await this.fetchTargetSnapshot(slug, target)
      if (snapshot) return snapshot
    }

    throw new HttpError(404, 'Protocol metrics are not available for this project')
  }

  private async fetchFreshOrStale(slug: string): Promise<ProtocolMetricsSnapshot> {
    try {
      const snapshot = await this.fetchFromDefiLlama(slug)
      await this.repository.upsert(slug, snapshot.defillamaId, snapshot)
      return snapshot
    } catch (error) {
      const staleInDb = await this.repository.getAny(slug)
      if (staleInDb) return this.enrichSnapshot({ ...staleInDb, stale: true })

      if (error instanceof HttpError) throw error
      throw new HttpError(502, 'Unable to fetch protocol metrics right now')
    }
  }

  async getProjectProtocolMetrics(slug: string): Promise<ProtocolMetricsSnapshot> {
    if (resolveMetricsTargets(slug).length === 0) {
      throw new HttpError(404, 'Protocol metrics are not available for this project')
    }

    const cachedInMemory = this.memory.get(memoryCacheKey(slug))
    if (cachedInMemory) return this.enrichSnapshot(cachedInMemory)

    const freshInDb = await this.repository.getFresh(slug)
    if (freshInDb) return this.remember(slug, freshInDb)

    const snapshot = await this.fetchFreshOrStale(slug)
    return this.remember(slug, snapshot)
  }
}

export const protocolMetricsService = new ProtocolMetricsService()
