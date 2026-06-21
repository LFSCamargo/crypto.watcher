import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/render'
import { ProjectPricePanel } from '../components/project-price-panel'

vi.mock('../hooks/use-market-price', () => ({
  useMarketPrice: vi.fn(),
}))

import { useMarketPrice } from '../hooks/use-market-price'

describe('ProjectPricePanel', () => {
  it('shows loading skeletons while market data is fetching', () => {
    vi.mocked(useMarketPrice).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as never)

    renderWithProviders(<ProjectPricePanel slug="bitcoin" />)

    expect(screen.getByText('Price movement')).toBeInTheDocument()
    expect(document.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders cached market snapshot values', () => {
    vi.mocked(useMarketPrice).mockReturnValue({
      data: {
        slug: 'bitcoin',
        coingeckoId: 'bitcoin',
        currency: 'usd',
        price: 121,
        change24h: 5.2,
        change7d: 10,
        change1m: 21,
        change1y: 51.25,
        history: [
          { timestamp: 1, price: 100 },
          { timestamp: 2, price: 121 },
        ],
        cachedAt: '2024-01-01T00:00:00.000Z',
        expiresAt: '2024-01-01T03:00:00.000Z',
      },
      isLoading: false,
      isError: false,
      error: null,
    } as never)

    renderWithProviders(<ProjectPricePanel slug="bitcoin" />)

    expect(screen.getByText('$121.00')).toBeInTheDocument()
    expect(screen.getByText('+5.20%')).toBeInTheDocument()
  })
})
