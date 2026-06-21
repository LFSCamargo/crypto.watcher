import { describe, expect, it } from 'vitest'
import { DAY_MS } from '../lib/market-changes'
import { buildMarketSnapshot } from '../lib/market-snapshot'

describe('buildMarketSnapshot', () => {
  it('computes current price and percentage changes across all windows', () => {
    const now = Date.now()
    const prices: [number, number][] = [
      [now - 365 * DAY_MS, 80],
      [now - 30 * DAY_MS, 100],
      [now - 7 * DAY_MS, 110],
      [now - DAY_MS, 115],
      [now, 121],
    ]

    const snapshot = buildMarketSnapshot('bitcoin', 'bitcoin', prices, new Date(now))

    expect(snapshot.price).toBe(121)
    expect(snapshot.change24h).toBeCloseTo(5.217, 2)
    expect(snapshot.change7d).toBeCloseTo(10, 5)
    expect(snapshot.change1m).toBeCloseTo(21, 5)
    expect(snapshot.change1y).toBeCloseTo(51.25, 2)
    expect(snapshot.history).toHaveLength(5)
  })
})
