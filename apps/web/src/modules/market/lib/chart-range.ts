import type { PricePoint } from './market.types'
import { DAY_MS } from './market-changes'

export type ChartRange = '1d' | '1w' | '1m' | '1y'

export const CHART_RANGE_OPTIONS: ReadonlyArray<{
  id: ChartRange
  label: string
  durationMs: number
}> = [
  { id: '1d', label: '1D', durationMs: DAY_MS },
  { id: '1w', label: '1W', durationMs: 7 * DAY_MS },
  { id: '1m', label: '1M', durationMs: 30 * DAY_MS },
  { id: '1y', label: '1Y', durationMs: 365 * DAY_MS },
]

export function filterChartHistory(history: PricePoint[], range: ChartRange): PricePoint[] {
  if (history.length === 0) return []
  if (history.length === 1) return history

  const lastTimestamp = history.at(-1)!.timestamp
  const durationMs = CHART_RANGE_OPTIONS.find((option) => option.id === range)!.durationMs
  const startTimestamp = lastTimestamp - durationMs
  const filtered = history.filter((point) => point.timestamp >= startTimestamp)

  if (filtered.length >= 2) return filtered

  const fallbackCount =
    range === '1d' ? 24 : range === '1w' ? 168 : range === '1m' ? 720 : history.length

  return history.slice(-Math.min(history.length, Math.max(2, fallbackCount)))
}

export function computePeriodChange(history: PricePoint[]): number | null {
  if (history.length < 2) return null

  const first = history[0]!.price
  const last = history.at(-1)!.price
  if (first <= 0) return null

  return ((last - first) / first) * 100
}
