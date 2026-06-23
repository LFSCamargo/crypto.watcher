import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/render'
import { ProtocolValuationSection } from '../components/protocol-valuation-section'
import type { ProtocolMetricsSnapshot } from '../lib/protocol-metrics.types'

const baseSnapshot: ProtocolMetricsSnapshot = {
  slug: 'aave',
  entityType: 'protocol',
  defillamaId: 'protocol:aave',
  name: 'Aave',
  category: 'Lending',
  website: null,
  chains: ['Ethereum'],
  mcap: 1_000_000_000,
  tvl: 10_000_000_000,
  tvlChange24h: 1,
  tvlChange7d: 2,
  tvlChange30d: 3,
  tvlHistory: [],
  chainBreakdown: [],
  tokenComposition: [],
  fees24h: 100_000,
  fees7d: 700_000,
  fees30d: 3_000_000,
  feesChange1d: null,
  feesHistory: [],
  revenue24h: 50_000,
  revenue7d: 350_000,
  revenue30d: 1_500_000,
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

describe('ProtocolValuationSection', () => {
  it('renders valuation metrics when the API provides a model output', () => {
    renderWithProviders(
      <ProtocolValuationSection
        data={{
          ...baseSnapshot,
          valuation: {
            feesAnnualizedUsd: 36_000_000,
            revenueAnnualizedUsd: 18_000_000,
            revenueCaptureRate: 50,
            revenueGrowth30d: 5,
            revenueGrowth1y: null,
            feeSustainabilityScore: 70,
            governanceQualityScore: 65,
            securityScore: 90,
            compositeScore: 72,
            revenueToTvlRatio: 0.18,
            feeToTvlRatio: 0.36,
            priceToSalesRatio: 12,
            methodologyVersion: 'CW-Valuation-v1',
          },
        }}
      />,
    )

    expect(screen.getByText('On-chain valuation model')).toBeInTheDocument()
    expect(screen.getByText(/Composite 72\/100/)).toBeInTheDocument()
  })

  it('renders network fee valuation for chains with model output', () => {
    renderWithProviders(
      <ProtocolValuationSection
        data={{
          ...baseSnapshot,
          slug: 'base',
          entityType: 'chain',
          valuation: {
            feesAnnualizedUsd: 900_000_000,
            revenueAnnualizedUsd: null,
            revenueCaptureRate: null,
            revenueGrowth30d: null,
            revenueGrowth1y: null,
            feeSustainabilityScore: 81,
            governanceQualityScore: null,
            securityScore: null,
            compositeScore: 81,
            revenueToTvlRatio: null,
            feeToTvlRatio: 22.5,
            priceToSalesRatio: null,
            methodologyVersion: 'CW-Valuation-v1',
          },
        }}
      />,
    )

    expect(screen.getByText('Network fee valuation')).toBeInTheDocument()
    expect(screen.getByText(/Composite 81\/100/)).toBeInTheDocument()
    expect(screen.queryByText(/Partial valuation pending/i)).not.toBeInTheDocument()
  })

  it('explains when valuation data is not available yet', () => {
    renderWithProviders(
      <ProtocolValuationSection
        data={{
          ...baseSnapshot,
          fees30d: null,
          fees24h: null,
          fees7d: null,
          revenue30d: null,
          feesHistory: [],
        }}
      />,
    )

    expect(screen.getByText('On-chain valuation unavailable')).toBeInTheDocument()
    expect(screen.getByText(/DeFi Llama has not indexed daily fee data/i)).toBeInTheDocument()
  })

  it('explains why stablecoins skip the valuation model', () => {
    renderWithProviders(
      <ProtocolValuationSection
        data={{
          ...baseSnapshot,
          entityType: 'stablecoin',
          slug: 'usd-coin',
        }}
      />,
    )

    expect(screen.getByText('Valuation model not applicable')).toBeInTheDocument()
    expect(screen.getByText(/Stablecoins are assessed on reserve quality/i)).toBeInTheDocument()
  })
})
