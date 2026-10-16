export const DAY_MS = 24 * 60 * 60 * 1000
/** Trailing window retained in API snapshots — supports 1Y chart ranges. */
export const TVL_HISTORY_DAYS = 365
export const METRIC_HISTORY_DAYS = 365

export function computePercentChange(
  current: number,
  past: number | null,
): number | null {
  if (past === null || past <= 0) return null
  return ((current - past) / past) * 100
}

export function findClosestValue(
  points: { timestamp: number; value: number }[],
  targetTimestamp: number,
): number | null {
  if (points.length === 0) return null

  const closest = points.reduce((best, point) => {
    const currentDistance = Math.abs(point.timestamp - targetTimestamp)
    const bestDistance = Math.abs(best.timestamp - targetTimestamp)
    return currentDistance < bestDistance ? point : best
  })

  return closest.value
}

export function findClosestTvl(
  points: { timestamp: number; tvl: number }[],
  targetTimestamp: number,
): number | null {
  if (points.length === 0) return null

  const closest = points.reduce((best, point) => {
    const currentDistance = Math.abs(point.timestamp - targetTimestamp)
    const bestDistance = Math.abs(best.timestamp - targetTimestamp)
    return currentDistance < bestDistance ? point : best
  })

  return closest.tvl
}

function downsampleByDay<T extends { timestamp: number }>(
  points: T[],
  maxDays: number,
  pickLatest: (existing: T | undefined, next: T) => T,
): T[] {
  if (points.length === 0) return []

  const cutoff = points.at(-1)!.timestamp - maxDays * DAY_MS
  const recent = points.filter((point) => point.timestamp >= cutoff)
  const byDay = new Map<number, T>()

  for (const point of recent) {
    const dayKey = Math.floor(point.timestamp / DAY_MS)
    byDay.set(dayKey, pickLatest(byDay.get(dayKey), point))
  }

  return [...byDay.values()].sort((a, b) => a.timestamp - b.timestamp)
}

export function downsampleDailyHistory(
  points: { timestamp: number; tvl: number }[],
  maxDays = TVL_HISTORY_DAYS,
): { timestamp: number; tvl: number }[] {
  return downsampleByDay(points, maxDays, (_, next) => next)
}

export function downsampleDailyValues(
  points: { timestamp: number; value: number }[],
  maxDays = METRIC_HISTORY_DAYS,
): { timestamp: number; value: number }[] {
  return downsampleByDay(points, maxDays, (_, next) => next)
}
