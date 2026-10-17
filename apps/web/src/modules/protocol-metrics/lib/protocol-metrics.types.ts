/** Keep aligned with the API `PROTOCOL_METRICS_SNAPSHOT_VERSION`. */
export const PROTOCOL_METRICS_SNAPSHOT_VERSION = 10

export interface TvlPoint {
  timestamp: number
  tvl: number
}

export interface TimeSeriesPoint {
  timestamp: number
  value: number
}

export interface ChainTvlBreakdown {
  chain: string
  tvl: number
  share: number
}

export interface TokenComposition {
  symbol: string
  usd: number
  share: number
}

export interface ExploitRecord {
  date: string
  name: string
  classification: string | null
  amountUsd: number | null
  chain: string[]
  returnedFunds: number | null
}

export type CompositeComponent =
  | 'fundamentals'
  | 'security'
  | 'governance'
  | 'value'
  | 'feeSustainability'
  | 'securityBudget'
  | 'dilution'
  | 'settlement'

export interface CompositeBreakdownEntry {
  component: CompositeComponent
  score: number | null
  /** Effective share of the composite (0–1); scored entries sum to 1. */
  share: number
}

export interface ProtocolValuation {
  feesAnnualizedUsd: number | null
  revenueAnnualizedUsd: number | null
  revenueCaptureRate: number | null
  revenueGrowth30d: number | null
  revenueGrowth1y: number | null
  feeSustainabilityScore: number | null
  governanceQualityScore: number | null
  securityScore: number | null
  compositeScore: number | null
  compositeBreakdown: CompositeBreakdownEntry[]
  revenueToTvlRatio: number | null
  feeToTvlRatio: number | null
  priceToSalesRatio: number | null
  methodologyVersion: string
}

export interface ProtocolMetricsSnapshot {
  slug: string
  entityType: 'protocol' | 'chain' | 'stablecoin'
  defillamaId: string
  name: string
  category: string | null
  website: string | null
  chains: string[]
  mcap: number | null
  priceUsd?: number | null
  settlementVolume1yUsd?: number | null
  tvl: number
  tvlChange24h: number | null
  tvlChange7d: number | null
  tvlChange30d: number | null
  tvlHistory: TvlPoint[]
  chainBreakdown: ChainTvlBreakdown[]
  tokenComposition: TokenComposition[]
  fees24h: number | null
  fees7d: number | null
  fees30d: number | null
  feesChange1d: number | null
  feesHistory: TimeSeriesPoint[]
  revenue24h: number | null
  revenue7d: number | null
  revenue30d: number | null
  revenueHistory: TimeSeriesPoint[]
  dexVolume24h: number | null
  dexVolume7d: number | null
  dexVolume30d: number | null
  dexVolumeChange1d: number | null
  dexVolumeHistory: TimeSeriesPoint[]
  exploits: ExploitRecord[]
  exploitCount: number
  totalExploitLossUsd: number | null
  valuation: ProtocolValuation | null
  snapshotVersion?: number
  cachedAt: string
  expiresAt: string
  stale?: boolean
}

/** When to fetch again and replace the snapshot. Passing this time does not delete it. */
export const PROTOCOL_METRICS_REFRESH_MS = 12 * 60 * 60 * 1000

/** Show the last saved snapshot through an outage, then allow an error after this. */
export const PROTOCOL_METRICS_RETENTION_MS = 7 * 24 * 60 * 60 * 1000

export const PROTOCOL_METRICS_STALE_TIME_MS = PROTOCOL_METRICS_REFRESH_MS

export const EMPTY_PROTOCOL_METRICS: Pick<
  ProtocolMetricsSnapshot,
  | 'chainBreakdown'
  | 'tokenComposition'
  | 'feesHistory'
  | 'revenueHistory'
  | 'dexVolumeHistory'
> = {
  chainBreakdown: [],
  tokenComposition: [],
  feesHistory: [],
  revenueHistory: [],
  dexVolumeHistory: [],
}
