import { describe, expect, it } from 'vitest'
import { DAY_MS } from '../protocol-metrics-changes'
import { computeProtocolValuation } from '../protocol-valuation'

function buildDailyHistory(
  days: number,
  dailyValue: number,
  endTimestamp = Date.now(),
): { timestamp: number; value: number }[] {
  return Array.from({ length: days }, (_, index) => ({
    timestamp: endTimestamp - (days - 1 - index) * DAY_MS,
    value: dailyValue,
  }))
}

describe('computeProtocolValuation', () => {
  it('computes revenue capture and annualized figures without divide-by-zero', () => {
    const now = Date.now()
    const feesHistory = buildDailyHistory(30, 100_000, now)
    const revenueHistory = buildDailyHistory(30, 40_000, now)

    const valuation = computeProtocolValuation({
      entityType: 'protocol',
      tvl: 1_000_000_000,
      mcap: 500_000_000,
      fees30d: 3_000_000,
      revenue30d: 1_200_000,
      feesHistory,
      revenueHistory,
      chainBreakdown: [
        { chain: 'Ethereum', tvl: 700_000_000, share: 70 },
        { chain: 'Arbitrum', tvl: 300_000_000, share: 30 },
      ],
      chainCount: 2,
      exploitCount: 0,
      totalExploitLossUsd: null,
    })

    expect(valuation).not.toBeNull()
    expect(valuation!.revenueCaptureRate).toBeCloseTo(40, 0)
    expect(valuation!.feesAnnualizedUsd).toBeGreaterThan(0)
    expect(valuation!.revenueAnnualizedUsd).toBeGreaterThan(0)
    expect(valuation!.priceToSalesRatio).toBeGreaterThan(0)
    expect(valuation!.securityScore).toBe(100)
    expect(valuation!.compositeScore).toBeGreaterThan(0)
  })

  it('penalizes security score for exploits and loss ratio', () => {
    const valuation = computeProtocolValuation({
      entityType: 'protocol',
      tvl: 100_000_000,
      mcap: null,
      fees30d: 1_000_000,
      revenue30d: null,
      feesHistory: buildDailyHistory(30, 33_333),
      revenueHistory: [],
      chainBreakdown: [],
      chainCount: 1,
      exploitCount: 2,
      totalExploitLossUsd: 5_000_000,
    })

    expect(valuation!.securityScore).toBeLessThan(80)
  })

  it('returns null when no financial or security inputs exist for stablecoins', () => {
    const valuation = computeProtocolValuation({
      entityType: 'stablecoin',
      tvl: 70_000_000_000,
      mcap: null,
      fees30d: null,
      revenue30d: null,
      feesHistory: [],
      revenueHistory: [],
      chainBreakdown: [],
      chainCount: 0,
      exploitCount: 0,
      totalExploitLossUsd: null,
    })

    expect(valuation).toBeNull()
  })

  it('computes chain valuation from fees when revenue is unavailable', () => {
    const valuation = computeProtocolValuation({
      entityType: 'chain',
      tvl: 40_000_000_000,
      mcap: null,
      fees30d: 240_000_000,
      revenue30d: null,
      feesHistory: buildDailyHistory(30, 8_000_000),
      revenueHistory: [],
      chainBreakdown: [],
      chainCount: 1,
      exploitCount: 0,
      totalExploitLossUsd: null,
    })

    expect(valuation!.feesAnnualizedUsd).toBeGreaterThan(0)
    expect(valuation!.feeSustainabilityScore).toBeGreaterThan(0)
    expect(valuation!.governanceQualityScore).toBeNull()
  })

  it('explains how each component compounds into the composite', () => {
    const now = Date.now()
    const valuation = computeProtocolValuation({
      entityType: 'protocol',
      tvl: 1_000_000_000,
      mcap: 500_000_000,
      fees30d: 3_000_000,
      revenue30d: 1_200_000,
      feesHistory: buildDailyHistory(60, 100_000, now),
      revenueHistory: buildDailyHistory(60, 40_000, now),
      chainBreakdown: [
        { chain: 'Ethereum', tvl: 700_000_000, share: 70 },
        { chain: 'Arbitrum', tvl: 300_000_000, share: 30 },
      ],
      chainCount: 2,
      exploitCount: 1,
      totalExploitLossUsd: 2_000_000,
    })

    const breakdown = valuation!.compositeBreakdown
    expect(breakdown.map((entry) => entry.component)).toEqual([
      'fundamentals',
      'security',
      'governance',
      'value',
    ])
    const scored = breakdown.filter((entry) => entry.score != null)
    expect(scored.reduce((sum, entry) => sum + entry.share, 0)).toBeCloseTo(1, 6)
    const recomposed = scored.reduce(
      (sum, entry) => sum + (entry.score ?? 0) * entry.share,
      0,
    )
    expect(recomposed).toBeCloseTo(valuation!.compositeScore!, 6)
  })

  it('gives unscored components no share and drops security for chains', () => {
    const valuation = computeProtocolValuation({
      entityType: 'chain',
      tvl: 40_000_000_000,
      mcap: null,
      fees30d: 240_000_000,
      revenue30d: null,
      feesHistory: buildDailyHistory(30, 8_000_000),
      revenueHistory: [],
      chainBreakdown: [],
      chainCount: 1,
      exploitCount: 0,
      totalExploitLossUsd: null,
    })

    const breakdown = valuation!.compositeBreakdown
    expect(breakdown.some((entry) => entry.component === 'security')).toBe(false)
    const fee = breakdown.find((entry) => entry.component === 'feeSustainability')
    expect(fee?.score).toBe(valuation!.feeSustainabilityScore)
    for (const entry of breakdown.filter((item) => item.score == null)) {
      expect(entry.share).toBe(0)
    }
  })
})
