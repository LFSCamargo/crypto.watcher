export const DAY_MS = 24 * 60 * 60 * 1000
export const CHART_WINDOW_MS = 7 * DAY_MS

export function computePercentChange(current: number, past: number | null): number | null {
  if (past === null || past <= 0) return null
  return ((current - past) / past) * 100
}
