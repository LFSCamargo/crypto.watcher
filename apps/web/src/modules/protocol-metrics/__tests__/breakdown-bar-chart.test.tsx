import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/render'
import { BreakdownBarChart } from '../components/breakdown-bar-chart'

describe('BreakdownBarChart', () => {
  it('renders chain bars and legend rows', () => {
    const { container } = renderWithProviders(
      <BreakdownBarChart
        title="TVL by chain"
        items={[
          { key: 'ethereum', label: 'Ethereum', value: 2_000_000_000, share: 71.1 },
          { key: 'base', label: 'Base', value: 400_000_000, share: 13.4 },
        ]}
        formatValue={(value) => `$${value}`}
        iconVariant="chain"
      />,
    )

    expect(screen.getByText('TVL by chain')).toBeInTheDocument()
    expect(screen.getAllByText('Ethereum').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Base').length).toBeGreaterThan(0)
    expect(screen.getByText('71.1% · $2000000000')).toBeInTheDocument()
    const sources = [...container.querySelectorAll('img')].map((img) => img.getAttribute('src'))
    expect(sources.filter((src) => src === '/icons/base.png')).toHaveLength(2)
    expect(sources.some((src) => src?.includes('rsz_base'))).toBe(false)
  })

  it('renders token composition with symbol labels', () => {
    renderWithProviders(
      <BreakdownBarChart
        title="TVL token composition"
        items={[
          { key: 'weth', label: 'WETH', value: 5_000_000_000, share: 60 },
          { key: 'usdc', label: 'USDC', value: 3_000_000_000, share: 40 },
        ]}
        formatValue={(value) => `$${value}`}
        iconVariant="token"
      />,
    )

    expect(screen.getByText('TVL token composition')).toBeInTheDocument()
    expect(screen.getAllByText('WETH').length).toBeGreaterThan(0)
    expect(screen.getByText('60.0% · $5000000000')).toBeInTheDocument()
  })

  it('renders bars with heights proportional to value', () => {
    const { container } = renderWithProviders(
      <BreakdownBarChart
        title="TVL by chain"
        items={[
          { key: 'ethereum', label: 'Ethereum', value: 2_000_000_000, share: 71.1 },
          { key: 'base', label: 'Base', value: 400_000_000, share: 13.4 },
        ]}
        formatValue={(value) => `$${value}`}
        wide
      />,
    )

    const bars = container.querySelectorAll('[data-testid="breakdown-bar"]')
    expect(bars.length).toBe(2)
    expect(
      Number.parseInt(
        bars[0]?.getAttribute('style')?.match(/height:\s*(\d+)px/)?.[1] ?? '0',
        10,
      ),
    ).toBeGreaterThan(
      Number.parseInt(
        bars[1]?.getAttribute('style')?.match(/height:\s*(\d+)px/)?.[1] ?? '0',
        10,
      ),
    )
  })

  it('shows empty state when there is no breakdown data', () => {
    renderWithProviders(
      <BreakdownBarChart
        title="TVL by chain"
        items={[]}
        formatValue={(value) => `$${value}`}
      />,
    )

    expect(screen.getByText('No breakdown data available.')).toBeInTheDocument()
  })
})
