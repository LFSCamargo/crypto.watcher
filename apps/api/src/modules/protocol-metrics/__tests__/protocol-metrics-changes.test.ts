import { describe, expect, it } from 'vitest'
import { METRIC_HISTORY_DAYS, TVL_HISTORY_DAYS } from '../protocol-metrics-changes'
import { normalizeChartHistory } from '../protocol-metrics-extractors'

describe('protocol-metrics history windows', () => {
  it('retains up to one year of daily chart points', () => {
    expect(TVL_HISTORY_DAYS).toBe(365)
    expect(METRIC_HISTORY_DAYS).toBe(365)
  })

  it('keeps 1y of fee history when DeFi Llama provides enough data', () => {
    const dayStart = Math.floor(Date.now() / 1000)
    const raw: [number, number][] = []

    for (let day = 0; day < 400; day += 1) {
      raw.push([dayStart + day * 86_400, 1_000 + day])
    }

    const history = normalizeChartHistory(raw)
    expect(history.length).toBeGreaterThanOrEqual(360)
    expect(history.length).toBeLessThanOrEqual(366)
  })
})
