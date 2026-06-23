import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/render'
import { ChainTvlBarChart } from '../components/chain-tvl-bar-chart'

describe('ChainTvlBarChart', () => {
  it('renders chain bars and legend rows', () => {
    renderWithProviders(
      <ChainTvlBarChart
        title="TVL by chain"
        items={[
          { chain: 'Ethereum', tvl: 2_000_000_000, share: 71.1 },
          { chain: 'Base', tvl: 400_000_000, share: 13.4 },
        ]}
        formatValue={(value) => `$${value}`}
      />,
    )

    expect(screen.getByText('TVL by chain')).toBeInTheDocument()
    expect(screen.getAllByText('Ethereum').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Base').length).toBeGreaterThan(0)
    expect(screen.getByText('71.1% · $2000000000')).toBeInTheDocument()
  })

  it('renders bars with heights proportional to TVL', () => {
    const { container } = renderWithProviders(
      <ChainTvlBarChart
        title="TVL by chain"
        items={[
          { chain: 'Ethereum', tvl: 2_000_000_000, share: 71.1 },
          { chain: 'Base', tvl: 400_000_000, share: 13.4 },
        ]}
        formatValue={(value) => `$${value}`}
        wide
      />,
    )

    const bars = container.querySelectorAll('[data-testid="chain-bar"]')
    expect(bars.length).toBe(2)
    expect(Number.parseInt(bars[0]?.getAttribute('style')?.match(/height:\s*(\d+)px/)?.[1] ?? '0', 10))
      .toBeGreaterThan(
        Number.parseInt(bars[1]?.getAttribute('style')?.match(/height:\s*(\d+)px/)?.[1] ?? '0', 10),
      )
  })

  it('shows empty state when there is no breakdown data', () => {
    renderWithProviders(
      <ChainTvlBarChart title="TVL by chain" items={[]} formatValue={(value) => `$${value}`} />,
    )

    expect(screen.getByText('No breakdown data available.')).toBeInTheDocument()
  })
})
