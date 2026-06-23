import { describe, expect, it } from 'vitest'
import { computeProtocolValuationFromSnapshot, hasDisplayableValuation } from '../../modules/protocol-metrics/lib/compute-protocol-valuation'
import { enrichProtocolMetricsSnapshot } from '../../modules/protocol-metrics/lib/enrich-protocol-metrics-snapshot'
import type { ProtocolMetricsSnapshot } from '../../modules/protocol-metrics/lib/protocol-metrics.types'

const baseSnapshot: ProtocolMetricsSnapshot = {
  slug: 'base',
  entityType: 'chain',
  defillamaId: 'chain:Base',
  name: 'Base',
  category: 'Chain',
  website: null,
  chains: ['Base'],
  mcap: null,
  tvl: 4_000_000_000,
  tvlChange24h: 1,
  tvlChange7d: 2,
  tvlChange30d: 3,
  tvlHistory: [],
  chainBreakdown: [],
  tokenComposition: [],
  fees24h: 2_500_000,
  fees7d: 17_500_000,
  fees30d: 72_000_000,
  feesChange1d: null,
  feesHistory: Array.from({ length: 30 }, (_, index) => ({
    timestamp: Date.now() - (29 - index) * 86_400_000,
    value: 2_400_000,
  })),
  revenue24h: null,
  revenue7d: null,
  revenue30d: null,
  revenueHistory: [],
  dexVolume24h: null,
  dexVolume7d: null,
  dexVolume30d: null,
  dexVolumeChange1d: null,
  dexVolumeHistory: [],
  exploits: [],
  exploitCount: 0,
  totalExploitLossUsd: null,
  valuation: null,
  cachedAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-01T03:00:00.000Z',
}

describe('client-side protocol valuation enrich', () => {
  it('computes chain valuation when API omits valuation field', () => {
    const valuation = computeProtocolValuationFromSnapshot(baseSnapshot)

    expect(hasDisplayableValuation(valuation)).toBe(true)
    expect(valuation?.compositeScore).toBeGreaterThan(0)
    expect(valuation?.feesAnnualizedUsd).toBeGreaterThan(0)
  })

  it('enriches normalized snapshots missing valuation', () => {
    const enriched = enrichProtocolMetricsSnapshot(baseSnapshot)

    expect(hasDisplayableValuation(enriched.valuation)).toBe(true)
    expect(enriched.valuation?.feeToTvlRatio).toBeGreaterThan(0)
  })
})
