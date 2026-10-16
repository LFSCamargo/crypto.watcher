import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/render'
import { ProtocolMetricsPanel } from '../components/protocol-metrics-panel'

vi.mock('../hooks/use-protocol-metrics', () => ({
  useProtocolMetrics: vi.fn(),
}))

vi.mock('../../market/components/price-chart', () => ({
  PriceChart: () => <div data-testid="metric-chart">chart</div>,
}))

import { useProtocolMetrics } from '../hooks/use-protocol-metrics'
import { ProtocolMetricsUnavailableError } from '../lib/protocol-metrics-errors'

const mockSnapshot = {
  slug: 'aave',
  entityType: 'protocol' as const,
  defillamaId: 'protocol:aave',
  name: 'Aave',
  category: 'Lending',
  website: 'https://aave.com',
  chains: ['Ethereum'],
  mcap: 1_500_000_000,
  tvl: 12_600_000_000,
  tvlChange24h: 5,
  tvlChange7d: 10,
  tvlChange30d: 20,
  tvlHistory: [
    { timestamp: 1, tvl: 10_000_000_000 },
    { timestamp: 2, tvl: 12_600_000_000 },
  ],
  chainBreakdown: [{ chain: 'Ethereum', tvl: 12_600_000_000, share: 100 }],
  tokenComposition: [{ symbol: 'WETH', usd: 12_600_000_000, share: 100 }],
  fees24h: 100_000,
  fees7d: 700_000,
  fees30d: 3_000_000,
  feesChange1d: 1.2,
  feesHistory: [
    { timestamp: 1, value: 90_000 },
    { timestamp: 2, value: 100_000 },
  ],
  revenue24h: 50_000,
  revenue7d: 350_000,
  revenue30d: 1_500_000,
  revenueHistory: [
    { timestamp: 1, value: 40_000 },
    { timestamp: 2, value: 50_000 },
  ],
  dexVolume24h: null,
  dexVolume7d: null,
  dexVolume30d: null,
  dexVolumeChange1d: null,
  dexVolumeHistory: [],
  exploits: [],
  exploitCount: 0,
  totalExploitLossUsd: null,
  valuation: {
    feesAnnualizedUsd: 36_500_000,
    revenueAnnualizedUsd: 18_250_000,
    revenueCaptureRate: 50,
    revenueGrowth30d: 0,
    revenueGrowth1y: null,
    feeSustainabilityScore: 72,
    governanceQualityScore: 68,
    securityScore: 100,
    compositeScore: 75,
    revenueToTvlRatio: 1.4,
    feeToTvlRatio: 2.9,
    priceToSalesRatio: 27.4,
    compositeBreakdown: [],
    methodologyVersion: 'CW-Valuation-v1',
  },
  cachedAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-01T03:00:00.000Z',
}

describe('ProtocolMetricsPanel', () => {
  it('renders nothing when protocol metrics are unavailable for the slug', () => {
    vi.mocked(useProtocolMetrics).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ProtocolMetricsUnavailableError(),
    } as never)

    const { container } = renderWithProviders(<ProtocolMetricsPanel slug="bitcoin" />)

    expect(container).toBeEmptyDOMElement()
  })

  it('shows loading skeletons while protocol metrics are fetching', () => {
    vi.mocked(useProtocolMetrics).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as never)

    renderWithProviders(<ProtocolMetricsPanel slug="aave" />)

    expect(screen.getByText('Protocol fundamentals')).toBeInTheDocument()
    expect(document.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders cached protocol metrics snapshot values', () => {
    vi.mocked(useProtocolMetrics).mockReturnValue({
      data: mockSnapshot,
      isLoading: false,
      isError: false,
      error: null,
    } as never)

    renderWithProviders(<ProtocolMetricsPanel slug="aave" />)

    expect(screen.getByText('$12.60B')).toBeInTheDocument()
    expect(screen.getByText('TVL by chain')).toBeInTheDocument()
    expect(screen.getByText('TVL token composition')).toBeInTheDocument()
    expect(screen.getByText('Daily fees')).toBeInTheDocument()
    expect(screen.getByText('On-chain valuation model')).toBeInTheDocument()
    expect(screen.getAllByTestId('metric-chart').length).toBeGreaterThan(0)
  })

  it('shows network revenue stats and chart for chain snapshots', () => {
    vi.mocked(useProtocolMetrics).mockReturnValue({
      data: {
        ...mockSnapshot,
        slug: 'solana',
        entityType: 'chain' as const,
        defillamaId: 'chain:Solana',
        name: 'Solana',
        category: 'Chain',
        website: null,
        chains: ['Solana'],
        mcap: null,
        chainBreakdown: [],
        tokenComposition: [],
        exploits: [],
        exploitCount: 0,
        totalExploitLossUsd: null,
        revenue24h: 5_100_000,
        revenue7d: 32_000_000,
        revenue30d: 165_000_000,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as never)

    renderWithProviders(<ProtocolMetricsPanel slug="solana" />)

    expect(screen.getByText('On-chain DeFi activity')).toBeInTheDocument()
    expect(screen.getByText('Network revenue 24h')).toBeInTheDocument()
    expect(screen.getByText('$5.10M')).toBeInTheDocument()
    expect(screen.getByText('Daily network revenue')).toBeInTheDocument()
    expect(screen.getByText('Network revenue (annualized)')).toBeInTheDocument()
  })
})
