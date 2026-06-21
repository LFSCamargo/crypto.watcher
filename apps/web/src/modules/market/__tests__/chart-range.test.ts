import { describe, expect, it } from 'vitest'
import { DAY_MS } from '../lib/market-changes'
import { filterChartHistory, computePeriodChange } from '../lib/chart-range'

describe('filterChartHistory', () => {
  const now = Date.now()
  const history = Array.from({ length: 40 }, (_, index) => ({
    timestamp: now - (39 - index) * DAY_MS,
    price: 100 + index,
  }))

  it('filters to the selected window', () => {
    const oneWeek = filterChartHistory(history, '1w')
    expect(oneWeek.length).toBeGreaterThanOrEqual(7)
    expect(oneWeek[0]?.timestamp).toBeGreaterThanOrEqual(now - 7 * DAY_MS)
  })

  it('computes period change from first to last point', () => {
    const oneWeek = filterChartHistory(history, '1w')
    const first = oneWeek[0]!.price
    const last = oneWeek.at(-1)!.price
    expect(computePeriodChange(oneWeek)).toBeCloseTo(((last - first) / first) * 100, 5)
  })
})
