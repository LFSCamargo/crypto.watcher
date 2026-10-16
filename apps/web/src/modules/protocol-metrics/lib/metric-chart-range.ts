import type { TimeSeriesPoint } from '../lib/protocol-metrics.types'

export const DAY_MS = 24 * 60 * 60 * 1000

export type ChartRange = '1w' | '1m' | '3m' | '1y'

const BASE_METRIC_CHART_RANGE_OPTIONS = [
  { id: '1w', label: '1W', durationMs: 7 * DAY_MS },
  { id: '1m', label: '1M', durationMs: 30 * DAY_MS },
  { id: '3m', label: '3M', durationMs: 90 * DAY_MS },
] as const satisfies ReadonlyArray<{
  id: ChartRange
  label: string
  durationMs: number
}>

export const METRIC_CHART_RANGE_OPTIONS: ReadonlyArray<{
  id: ChartRange
  label: string
  durationMs: number
}> = [
  ...BASE_METRIC_CHART_RANGE_OPTIONS,
  { id: '1y', label: '1Y', durationMs: 365 * DAY_MS },
]

export const TVL_CHART_RANGE_OPTIONS = METRIC_CHART_RANGE_OPTIONS

export function filterMetricHistory(
  history: TimeSeriesPoint[],
  range: ChartRange,
): TimeSeriesPoint[] {
  if (history.length === 0) return []
  if (history.length === 1) return history

  const lastTimestamp = history.at(-1)!.timestamp
  const durationMs = METRIC_CHART_RANGE_OPTIONS.find(
    (option) => option.id === range,
  )!.durationMs
  const startTimestamp = lastTimestamp - durationMs
  const filtered = history.filter((point) => point.timestamp >= startTimestamp)

  if (filtered.length >= 2) return filtered
  return history.slice(-Math.min(history.length, Math.max(2, 30)))
}

export function computeMetricPeriodChange(history: TimeSeriesPoint[]): number | null {
  if (history.length < 2) return null

  const first = history[0]!.value
  const last = history.at(-1)!.value
  if (first <= 0) return null

  return ((last - first) / first) * 100
}

export function toChartPoints(
  history: TimeSeriesPoint[],
): { timestamp: number; price: number }[] {
  return history.map((point) => ({ timestamp: point.timestamp, price: point.value }))
}

export function tvlToChartPoints(
  history: { timestamp: number; tvl: number }[],
): { timestamp: number; price: number }[] {
  return history.map((point) => ({ timestamp: point.timestamp, price: point.tvl }))
}
