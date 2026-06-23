import { describe, expect, it } from 'vitest'
import {
  annualizeFromWindowSum,
  clamp,
  safeDivide,
  safePercentChange,
  sumSeriesInWindow,
  weightedAverage,
} from '../safe-math'

describe('safe-math', () => {
  it('safeDivide returns fallback on zero denominator', () => {
    expect(safeDivide(10, 0, null)).toBeNull()
    expect(safeDivide(10, 0, 0)).toBe(0)
  })

  it('safeDivide returns null for non-finite inputs', () => {
    expect(safeDivide(Number.NaN, 5, null)).toBeNull()
    expect(safeDivide(5, Number.POSITIVE_INFINITY, null)).toBeNull()
  })

  it('safePercentChange guards zero previous value', () => {
    expect(safePercentChange(100, 0)).toBeNull()
    expect(safePercentChange(150, 100)).toBe(50)
  })

  it('annualizeFromWindowSum extrapolates daily average to 365 days', () => {
    expect(annualizeFromWindowSum(300, 30)).toBe(3650)
  })

  it('weightedAverage renormalizes when some components are missing', () => {
    expect(
      weightedAverage([
        { value: 80, weight: 0.5 },
        { value: null, weight: 0.5 },
      ]),
    ).toBe(80)
  })

  it('sumSeriesInWindow sums only in range', () => {
    const sum = sumSeriesInWindow(
      [
        { timestamp: 0, value: 10 },
        { timestamp: 50, value: 20 },
        { timestamp: 100, value: 30 },
      ],
      25,
      75,
    )
    expect(sum).toBe(20)
  })

  it('clamp keeps values in bounds', () => {
    expect(clamp(150, 0, 100)).toBe(100)
    expect(clamp(-5, 0, 100)).toBe(0)
  })
})
