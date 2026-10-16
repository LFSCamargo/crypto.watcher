import { describe, expect, it } from 'vitest'
import { DAY_MS } from '../protocol-metrics-changes'
import {
  extractChainBreakdown,
  extractStablecoinChainBreakdown,
  extractTokenComposition,
  normalizeChartHistory,
  normalizeStablecoinHistory,
} from '../protocol-metrics-extractors'

describe('protocol-metrics extractors', () => {
  it('builds chain breakdown with share percentages', () => {
    const breakdown = extractChainBreakdown({
      Ethereum: 60_000_000,
      Arbitrum: 40_000_000,
    })

    expect(breakdown).toHaveLength(2)
    expect(breakdown[0]?.chain).toBe('Ethereum')
    expect(breakdown[0]?.share).toBeCloseTo(60, 1)
  })

  it('extracts token composition from nested tokensInUsd snapshots', () => {
    const composition = extractTokenComposition([
      { date: 1, tokens: { WETH: 100, USDC: 50 } },
      { date: 2, tokens: { WETH: 200, USDC: 100, DAI: 50 } },
    ])

    expect(composition[0]?.symbol).toBe('WETH')
    expect(composition[0]?.usd).toBe(200)
    expect(composition[0]?.share).toBeCloseTo(57.14, 1)
  })

  it('extracts token composition from flat tokensInUsd snapshots', () => {
    const composition = extractTokenComposition([{ WETH: 200, USDC: 100 }])
    expect(composition[0]?.symbol).toBe('WETH')
  })

  it('normalizes fee chart history to millisecond timestamps', () => {
    const now = Math.floor(Date.now() / 1000)
    const history = normalizeChartHistory([
      [now - 86_400, 1000],
      [now, 1500],
    ])

    expect(history).toHaveLength(2)
    expect(history[0]?.timestamp).toBeGreaterThan(1_000_000_000_000)
    expect(history[1]?.value).toBe(1500)
  })

  it('downsamples chart history to one point per day', () => {
    const dayStart = Math.floor(Date.now() / 1000)
    const history = normalizeChartHistory([
      [dayStart, 100],
      [dayStart + 3600, 110],
      [dayStart + 86_400, 200],
    ])

    expect(history.length).toBeLessThanOrEqual(2)
  })

  it('builds stablecoin chain breakdown from pegged balances', () => {
    const breakdown = extractStablecoinChainBreakdown({
      Ethereum: { peggedUSD: 50_000_000_000 },
      Base: { peggedUSD: 10_000_000_000 },
    })

    expect(breakdown[0]?.chain).toBe('Ethereum')
    expect(breakdown[0]?.share).toBeCloseTo(83.33, 1)
  })

  it('normalizes stablecoin circulating supply history', () => {
    const now = Math.floor(Date.now() / 1000)
    const history = normalizeStablecoinHistory([
      { date: now - 86_400, circulating: { peggedUSD: 70_000_000_000 } },
      { date: now, circulating: { peggedUSD: 74_000_000_000 } },
    ])

    expect(history).toHaveLength(2)
    expect(history.at(-1)?.tvl).toBe(74_000_000_000)
  })
})

describe('buildProtocolMetricsSnapshot extended fields', () => {
  it('includes chain breakdown and histories when provided', async () => {
    const { buildProtocolMetricsSnapshot } = await import('../protocol-metrics.service')
    const now = Date.now()

    const snapshot = buildProtocolMetricsSnapshot(
      'aave',
      'aave',
      {
        id: 'aave',
        name: 'Aave',
        category: 'Lending',
        url: 'https://aave.com',
        chains: ['Ethereum'],
        mcap: 1_500_000_000,
        currentChainTvls: { Ethereum: 12_600_000_000 },
        tokensInUsd: [{ WETH: 5_000_000_000, USDC: 3_000_000_000 }],
        tvl: [{ date: Math.floor(now / 1000), totalLiquidityUSD: 12_600_000_000 }],
      },
      {
        total24h: 100_000,
        totalDataChart: [
          [Math.floor(now / 1000) - DAY_MS / 1000, 90000],
          [Math.floor(now / 1000), 100_000],
        ],
      },
      {
        total24h: 50_000,
        totalDataChart: [[Math.floor(now / 1000), 50_000]],
      },
      null,
      new Date(now),
    )

    expect(snapshot?.entityType).toBe('protocol')
    expect(snapshot?.chainBreakdown[0]?.chain).toBe('Ethereum')
    expect(snapshot?.tokenComposition[0]?.symbol).toBe('WETH')
    expect(snapshot?.feesHistory.length).toBeGreaterThan(0)
    expect(snapshot?.revenueHistory.length).toBeGreaterThan(0)
  })
})
