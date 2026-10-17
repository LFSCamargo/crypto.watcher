import { describe, expect, it } from 'vitest'
import { METRIC_HISTORY_DAYS, TVL_HISTORY_DAYS } from '../protocol-metrics-changes'
import { normalizeChartHistory } from '../protocol-metrics-extractors'

describe('protocol-metrics history windows', () => {
  it('retains one year of TVL and two years of fee history', () => {
    expect(TVL_HISTORY_DAYS).toBe(365)
    expect(METRIC_HISTORY_DAYS).toBe(730)
  })

  it('keeps two years of fee history when DeFi Llama provides enough data', () => {
    const dayStart = Math.floor(Date.now() / 1000)
    const raw: [number, number][] = []

    for (let day = 0; day < 800; day += 1) {
      raw.push([dayStart + day * 86_400, 1_000 + day])
    }

    const history = normalizeChartHistory(raw)
    expect(history.length).toBeGreaterThanOrEqual(720)
    expect(history.length).toBeLessThanOrEqual(731)
  })
})
