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

  it('uses chain network revenue when DeFi Llama reports it', () => {
    const valuation = computeProtocolValuation({
      entityType: 'chain',
      tvl: 8_200_000_000,
      mcap: null,
      fees30d: 400_000_000,
      revenue30d: 165_000_000,
      feesHistory: buildDailyHistory(30, 13_000_000),
      revenueHistory: buildDailyHistory(30, 5_500_000),
      chainBreakdown: [],
      chainCount: 1,
      exploitCount: 0,
      totalExploitLossUsd: null,
    })

    expect(valuation!.revenueAnnualizedUsd).toBeGreaterThan(0)
    expect(valuation!.revenueCaptureRate).toBeGreaterThan(0)
    expect(valuation!.revenueCaptureRate).toBeLessThan(100)
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

  it('computes one-year revenue growth and price-to-sales when the inputs exist', () => {
    const now = Date.now()
    const history = Array.from({ length: 800 }, (_, index) => {
      const age = 799 - index
      return {
        timestamp: now - age * DAY_MS,
        value: age > 365 ? 100 : 150,
      }
    })

    const valuation = computeProtocolValuation({
      entityType: 'chain',
      tvl: 4_000_000_000,
      mcap: 1_600_000_000_000,
      fees30d: 900_000,
      revenue30d: 280_000,
      feesHistory: history,
      revenueHistory: history,
      chainBreakdown: [],
      chainCount: 1,
      exploitCount: 0,
      totalExploitLossUsd: null,
    })

    expect(valuation!.revenueGrowth1y).toBeGreaterThan(0)
    expect(valuation!.priceToSalesRatio).toBeGreaterThan(0)
    expect(valuation!.securityScore).toBeNull()
    expect(valuation!.governanceQualityScore).toBeNull()
    expect(valuation!.compositeBreakdown.some((entry) => entry.component === 'governance')).toBe(
      false,
    )
    expect(valuation!.compositeBreakdown.some((entry) => entry.component === 'security')).toBe(
      false,
    )
  })

  it('gives unscored components no share and omits protocol-only governance for chains', () => {
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
    expect(breakdown.some((entry) => entry.component === 'governance')).toBe(false)
    expect(breakdown.some((entry) => entry.component === 'security')).toBe(false)
    const fee = breakdown.find((entry) => entry.component === 'feeSustainability')
    expect(fee?.score).toBe(valuation!.feeSustainabilityScore)
    for (const entry of breakdown.filter((item) => item.score == null)) {
      expect(entry.share).toBe(0)
    }
  })

  it('keeps Ethereum on the fee and revenue model', () => {
    const valuation = computeProtocolValuation({
      slug: 'ethereum',
      entityType: 'chain',
      tvl: 40_000_000_000,
      mcap: 400_000_000_000,
      priceUsd: 3_000,
      settlementVolume1yUsd: null,
      fees30d: 240_000_000,
      revenue30d: 80_000_000,
      feesHistory: buildDailyHistory(30, 8_000_000),
      revenueHistory: buildDailyHistory(30, 2_600_000),
      chainBreakdown: [],
      chainCount: 1,
      exploitCount: 0,
      totalExploitLossUsd: null,
    })

    expect(valuation!.methodologyVersion).toBe('CW-Valuation-v1')
    expect(valuation!.compositeBreakdown.map((entry) => entry.component)).toEqual([
      'fundamentals',
      'value',
      'feeSustainability',
    ])
    expect(valuation!.feeSustainabilityScore).toBeGreaterThan(0)
  })

  it('scores Bitcoin as a reserve from security budget, dilution, and settlement', () => {
    const asOf = Date.parse('2026-10-17T00:00:00.000Z')
    const mcap = 1_000_000_000_000
    const priceUsd = 50_000
    const settlementVolume1yUsd = 20_000_000_000
    const feesHistory = buildDailyHistory(365, 10_000, asOf)

    const valuation = computeProtocolValuation({
      slug: 'bitcoin',
      entityType: 'chain',
      tvl: 8_000_000_000,
      mcap,
      priceUsd,
      settlementVolume1yUsd,
      asOf,
      fees30d: 300_000,
      revenue30d: 70_000,
      feesHistory,
      revenueHistory: buildDailyHistory(365, 2_000, asOf),
      chainBreakdown: [],
      chainCount: 1,
      exploitCount: 0,
      totalExploitLossUsd: null,
    })

    expect(valuation).not.toBeNull()
    expect(valuation!.methodologyVersion).toBe('CW-Reserve-v1')
    expect(valuation!.feeToTvlRatio).toBeGreaterThan(0)
    expect(valuation!.revenueToTvlRatio).toBeGreaterThan(0)
    expect(valuation!.priceToSalesRatio).toBeGreaterThan(0)

    const breakdown = valuation!.compositeBreakdown
    expect(breakdown.map((entry) => entry.component)).toEqual([
      'securityBudget',
      'dilution',
      'settlement',
    ])
    expect(breakdown.some((entry) => entry.component === 'feeSustainability')).toBe(false)
    expect(breakdown.reduce((sum, entry) => sum + entry.share, 0)).toBeCloseTo(1, 6)
    for (const entry of breakdown) {
      expect(entry.score).not.toBeNull()
      expect(entry.share).toBeCloseTo(1 / 3, 6)
    }

    const annualFees = 10_000 * 365
    const securityBudgetScore = Math.min((annualFees / mcap / 0.0005) * 100, 100)
    const issuanceBtc = 3.125 * ((365 * 24 * 60) / 10)
    const dilution = issuanceBtc / (mcap / priceUsd)
    const dilutionScore = Math.max(0, 100 - (dilution / 0.02) * 100)
    const nvt = mcap / settlementVolume1yUsd
    const settlementScore = Math.max(0, Math.min(100, 100 - ((nvt - 30) / 90) * 100))

    const security = breakdown.find((entry) => entry.component === 'securityBudget')
    const dilutionEntry = breakdown.find((entry) => entry.component === 'dilution')
    const settlement = breakdown.find((entry) => entry.component === 'settlement')
    expect(security!.score).toBeCloseTo(securityBudgetScore, 5)
    expect(dilutionEntry!.score).toBeCloseTo(dilutionScore, 5)
    expect(settlement!.score).toBeCloseTo(settlementScore, 5)

    const recomposed = breakdown.reduce(
      (sum, entry) => sum + (entry.score ?? 0) * entry.share,
      0,
    )
    expect(recomposed).toBeCloseTo(valuation!.compositeScore!, 6)
  })
})
