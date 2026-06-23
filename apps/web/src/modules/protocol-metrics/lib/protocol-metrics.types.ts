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

export interface ProtocolMetricsSnapshot {
  slug: string
  entityType: 'protocol' | 'chain'
  defillamaId: string
  name: string
  category: string | null
  website: string | null
  chains: string[]
  mcap: number | null
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
  cachedAt: string
  expiresAt: string
  stale?: boolean
}

export const PROTOCOL_METRICS_STALE_TIME_MS = 3 * 60 * 60 * 1000

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
