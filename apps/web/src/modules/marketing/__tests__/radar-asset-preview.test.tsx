import { cleanup, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { RadarAssetPreview } from '../components/radar-asset-preview'
import { renderWithProviders } from '../../../test/render'
import { mockApi } from '../../../test/mock-api'

function snapshot(overrides: Record<string, unknown> = {}) {
  return {
    slug: 'uniswap',
    entityType: 'protocol',
    defillamaId: 'uniswap',
    name: 'Uniswap',
    category: 'Dexs',
    website: null,
    chains: ['Ethereum', 'Arbitrum'],
    mcap: null,
    tvl: 4_200_000_000,
    tvlChange24h: null,
    tvlChange7d: 3.1,
    tvlChange30d: null,
    tvlHistory: [],
    chainBreakdown: [],
    tokenComposition: [],
    fees24h: null,
    fees7d: null,
    fees30d: 90_000_000,
    feesChange1d: null,
    feesHistory: [],
    revenue24h: null,
    revenue7d: null,
    revenue30d: null,
    revenueHistory: [],
    dexVolume24h: null,
    dexVolume7d: null,
    dexVolume30d: 60_000_000_000,
    dexVolumeChange1d: null,
    dexVolumeHistory: [],
    exploits: [],
    exploitCount: 1,
    totalExploitLossUsd: 2_000_000,
    valuation: {
      feesAnnualizedUsd: null,
      revenueAnnualizedUsd: null,
      revenueCaptureRate: null,
      revenueGrowth30d: null,
      revenueGrowth1y: null,
      feeSustainabilityScore: 74,
      governanceQualityScore: 74,
      securityScore: 88,
      compositeScore: 50,
      compositeBreakdown: [
        { component: 'fundamentals', score: 40, share: 0.35 },
        { component: 'security', score: 88, share: 0.3 },
        { component: 'governance', score: 74, share: 0.15 },
        { component: 'value', score: null, share: 0 },
      ],
      revenueToTvlRatio: null,
      feeToTvlRatio: null,
      priceToSalesRatio: null,
      methodologyVersion: 'CW-Valuation-v1',
    },
    cachedAt: '2026-10-16T00:00:00.000Z',
    expiresAt: '2026-10-16T03:00:00.000Z',
    ...overrides,
  }
}

describe('RadarAssetPreview', () => {
  afterEach(cleanup)

  it('summarises the reference grade and live protocol data', async () => {
    mockApi({ 'GET /protocol-metrics/projects/uniswap': [200, snapshot()] })
    renderWithProviders(<RadarAssetPreview slug="uniswap" />)

    expect(screen.getByRole('heading', { name: 'Uniswap' })).toBeInTheDocument()
    const grade = screen.getByRole('group', { name: 'Reference index' })
    expect(within(grade).getByText('93')).toBeInTheDocument()
    expect(within(grade).getByText('Low risk')).toBeInTheDocument()

    const live = await screen.findByRole('group', { name: 'Live protocol data' })
    expect(within(live).getByText('Total value locked')).toBeInTheDocument()
    expect(within(live).getByText('DEX volume (30d)')).toBeInTheDocument()
    expect(within(live).getByText(/1 recorded exploit/)).toBeInTheDocument()
  })

  it('shows how each component compounds into the composite', async () => {
    mockApi({ 'GET /protocol-metrics/projects/uniswap': [200, snapshot()] })
    renderWithProviders(<RadarAssetPreview slug="uniswap" />)

    const breakdown = await screen.findByRole('list', { name: 'Composite breakdown' })
    const security = within(breakdown)
      .getByText(/Security/)
      .closest('li')
    expect(security).toHaveTextContent('88')
    expect(security).toHaveTextContent('30%')
    const value = within(breakdown).getByText(/Value/).closest('li')
    expect(value).toHaveTextContent('No data')
    expect(screen.getByText('Composite 50/100')).toBeInTheDocument()
    expect(screen.getByText(/separate from the reference index/i)).toBeInTheDocument()
  })

  it('reports a clean exploit history', async () => {
    mockApi({
      'GET /protocol-metrics/projects/uniswap': [
        200,
        snapshot({ exploitCount: 0, totalExploitLossUsd: null }),
      ],
    })
    renderWithProviders(<RadarAssetPreview slug="uniswap" />)
    expect(await screen.findByText('No recorded exploits')).toBeInTheDocument()
  })

  it('draws network revenue and fee charts for chain assets such as Solana', async () => {
    const now = Date.now()
    mockApi({
      'GET /protocol-metrics/projects/solana': [
        200,
        snapshot({
          slug: 'solana',
          entityType: 'chain',
          name: 'Solana',
          category: 'Chain',
          chains: ['Solana'],
          revenue30d: 165_000_000,
          revenueHistory: [
            { timestamp: now - 86_400_000, value: 4_700_000 },
            { timestamp: now, value: 5_100_000 },
          ],
          fees30d: 400_000_000,
          feesHistory: [
            { timestamp: now - 86_400_000, value: 11_000_000 },
            { timestamp: now, value: 12_000_000 },
          ],
        }),
      ],
    })
    renderWithProviders(<RadarAssetPreview slug="solana" />)

    const live = await screen.findByRole('group', { name: 'Live protocol data' })
    expect(within(live).getByText('Network revenue (30d)')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Network revenue' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Network fees' })).toBeInTheDocument()
  })

  it('keeps the reference grade when live data is unavailable', async () => {
    mockApi({ 'GET /protocol-metrics/projects/uniswap': [404, {}] })
    renderWithProviders(<RadarAssetPreview slug="uniswap" />)
    expect(
      await screen.findByText('Live protocol data is unavailable right now.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Reference index' })).toBeInTheDocument()
  })
})
