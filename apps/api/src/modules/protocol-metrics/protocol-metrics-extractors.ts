import { downsampleDailyHistory, downsampleDailyValues } from './protocol-metrics-changes'
import type {
  ChainTvlBreakdown,
  TimeSeriesPoint,
  TokenComposition,
  TvlPoint,
} from './protocol-metrics.types'

const MAX_BREAKDOWN_ITEMS = 8

type DefiLlamaTvlPoint = {
  date: number
  totalLiquidityUSD: number
}

type ChainTvlsMap = Record<string, { tvl?: DefiLlamaTvlPoint[] }>

export function toMs(unixSeconds: number): number {
  return unixSeconds < 1_000_000_000_000 ? unixSeconds * 1000 : unixSeconds
}

export function aggregateTvlHistoryFromChains(
  chainTvls: ChainTvlsMap | undefined,
): TvlPoint[] {
  if (!chainTvls) return []

  const byDate = new Map<number, number>()
  for (const chain of Object.values(chainTvls)) {
    for (const point of chain.tvl ?? []) {
      if (!Number.isFinite(point.totalLiquidityUSD)) continue
      byDate.set(point.date, (byDate.get(point.date) ?? 0) + point.totalLiquidityUSD)
    }
  }

  const points = [...byDate.entries()]
    .map(([date, tvl]) => ({ timestamp: toMs(date), tvl }))
    .sort((a, b) => a.timestamp - b.timestamp)

  return downsampleDailyHistory(points)
}

export function normalizeTvlHistory(raw: DefiLlamaTvlPoint[] | undefined): TvlPoint[] {
  if (!Array.isArray(raw)) return []

  const points = raw
    .filter((point) => Number.isFinite(point.totalLiquidityUSD))
    .map((point) => ({
      timestamp: toMs(point.date),
      tvl: point.totalLiquidityUSD,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  return downsampleDailyHistory(points)
}

function withShares<T extends { usd: number }>(items: T[]): Array<T & { share: number }> {
  const total = items.reduce((sum, item) => sum + item.usd, 0)
  if (total <= 0) return []

  return items.map((item) => ({
    ...item,
    share: (item.usd / total) * 100,
  }))
}

function collapseBreakdown<T extends { share: number }>(
  items: T[],
  total: number,
  buildOther: (rest: T[]) => T,
): T[] {
  if (items.length <= MAX_BREAKDOWN_ITEMS) return items

  const top = items.slice(0, MAX_BREAKDOWN_ITEMS - 1)
  const rest = items.slice(MAX_BREAKDOWN_ITEMS - 1)

  return [...top, buildOther(rest)]
}

export function extractChainBreakdown(
  currentChainTvls: Record<string, number> | undefined,
): ChainTvlBreakdown[] {
  if (!currentChainTvls) return []

  const sorted = Object.entries(currentChainTvls)
    .filter(([, tvl]) => Number.isFinite(tvl) && tvl > 0)
    .map(([chain, tvl]) => ({ chain, usd: tvl }))
    .sort((a, b) => b.usd - a.usd)

  const total = sorted.reduce((sum, item) => sum + item.usd, 0)
  const withShare = withShares(sorted).map(({ chain, usd, share }) => ({
    chain,
    tvl: usd,
    share,
  }))

  return collapseBreakdown(withShare, total, (rest) => {
    const otherTvl = rest.reduce((sum, item) => sum + item.tvl, 0)
    return {
      chain: 'Other',
      tvl: otherTvl,
      share: total > 0 ? (otherTvl / total) * 100 : 0,
    }
  })
}

export function extractTokenComposition(tokensInUsd: unknown): TokenComposition[] {
  if (!Array.isArray(tokensInUsd) || tokensInUsd.length === 0) return []

  const latest = tokensInUsd.at(-1)
  if (!latest || typeof latest !== 'object') return []

  const record = latest as Record<string, unknown>
  const nestedTokens = record.tokens
  const tokenEntries =
    nestedTokens && typeof nestedTokens === 'object'
      ? Object.entries(nestedTokens as Record<string, unknown>)
      : Object.entries(record)

  const sorted = tokenEntries
    .filter(([key, value]) => key !== 'date' && typeof value === 'number' && value > 0)
    .map(([symbol, usd]) => ({ symbol, usd: usd as number }))
    .sort((a, b) => b.usd - a.usd)

  const total = sorted.reduce((sum, item) => sum + item.usd, 0)
  const withShare = withShares(sorted).map(({ symbol, usd, share }) => ({
    symbol,
    usd,
    share,
  }))

  return collapseBreakdown(withShare, total, (rest) => {
    const otherUsd = rest.reduce((sum, item) => sum + item.usd, 0)
    return {
      symbol: 'Other',
      usd: otherUsd,
      share: total > 0 ? (otherUsd / total) * 100 : 0,
    }
  })
}

export function normalizeChartHistory(
  raw: [number, number][] | undefined,
): TimeSeriesPoint[] {
  if (!Array.isArray(raw)) return []

  const points = raw
    .filter((point) => Array.isArray(point) && Number.isFinite(point[1]))
    .map(([date, value]) => ({
      timestamp: toMs(date),
      value,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  return downsampleDailyValues(points)
}

export function normalizeChainTvlHistory(
  raw: { date: number; tvl: number }[] | undefined,
): TvlPoint[] {
  if (!Array.isArray(raw)) return []

  const points = raw
    .filter((point) => Number.isFinite(point.tvl))
    .map((point) => ({
      timestamp: toMs(point.date),
      tvl: point.tvl,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  return downsampleDailyHistory(points)
}

export function sumChainTvls(
  currentChainTvls: Record<string, number> | undefined,
): number {
  if (!currentChainTvls) return 0
  return Object.values(currentChainTvls).reduce(
    (sum, tvl) => sum + (Number.isFinite(tvl) ? tvl : 0),
    0,
  )
}

type StablecoinChainBalance = {
  peggedUSD?: number
}

type StablecoinSupplyPoint = {
  date: number
  circulating?: StablecoinChainBalance
}

export function extractStablecoinChainBreakdown(
  currentChainBalances: Record<string, StablecoinChainBalance> | undefined,
): ChainTvlBreakdown[] {
  if (!currentChainBalances) return []

  const sorted = Object.entries(currentChainBalances)
    .map(([chain, balance]) => ({ chain, usd: balance?.peggedUSD ?? 0 }))
    .filter((item) => Number.isFinite(item.usd) && item.usd > 0)
    .sort((a, b) => b.usd - a.usd)

  const total = sorted.reduce((sum, item) => sum + item.usd, 0)
  const withShare = withShares(sorted).map(({ chain, usd, share }) => ({
    chain,
    tvl: usd,
    share,
  }))

  return collapseBreakdown(withShare, total, (rest) => {
    const otherTvl = rest.reduce((sum, item) => sum + item.tvl, 0)
    return {
      chain: 'Other',
      tvl: otherTvl,
      share: total > 0 ? (otherTvl / total) * 100 : 0,
    }
  })
}

export function normalizeStablecoinHistory(
  tokens: StablecoinSupplyPoint[] | undefined,
): TvlPoint[] {
  if (!Array.isArray(tokens)) return []

  const points = tokens
    .filter((point) => Number.isFinite(point.circulating?.peggedUSD))
    .map((point) => ({
      timestamp: toMs(point.date),
      tvl: point.circulating!.peggedUSD!,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  return downsampleDailyHistory(points)
}
