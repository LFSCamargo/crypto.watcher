import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('keeps the saved snapshot on screen when a refresh has failed', () => {
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
        expiresAt: '2024-01-01T12:00:00.000Z',
        stale: true,
      },
      isLoading: false,
      isError: true,
      error: new Error('API 500: upstream'),
    } as never)

    renderWithProviders(<ProjectPricePanel slug="bitcoin" />)

    expect(screen.getByText('$121.00')).toBeInTheDocument()
    expect(screen.getByText(/showing last saved prices/)).toBeInTheDocument()
    expect(screen.queryByText(/Unable to load price data/)).not.toBeInTheDocument()
  })

  it('keeps refresh locked until the saved snapshot is due', () => {
    vi.mocked(useMarketPrice).mockReturnValue({
      data: {
        slug: 'bitcoin',
        coingeckoId: 'bitcoin',
        currency: 'usd',
        price: 121,
        change24h: 1,
        change7d: 1,
        change1m: 1,
        change1y: 1,
        history: [
          { timestamp: 1, price: 100 },
          { timestamp: 2, price: 121 },
        ],
        cachedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
      isError: false,
      error: null,
    } as never)

    renderWithProviders(<ProjectPricePanel slug="bitcoin" />)

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled()
    expect(screen.getByText(/refresh available/i)).toBeInTheDocument()
  })

  it('shows a refresh indicator without replacing the saved price', () => {
    vi.mocked(useMarketPrice).mockReturnValue({
      data: {
        slug: 'bitcoin',
        coingeckoId: 'bitcoin',
        currency: 'usd',
        price: 121,
        change24h: 1,
        change7d: 1,
        change1m: 1,
        change1y: 1,
        history: [
          { timestamp: 1, price: 100 },
          { timestamp: 2, price: 121 },
        ],
        cachedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString(),
        stale: true,
      },
      isLoading: false,
      isFetching: true,
      refetch: vi.fn(),
      isError: false,
      error: null,
    } as never)

    renderWithProviders(<ProjectPricePanel slug="bitcoin" />)

    expect(screen.getByText('$121.00')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Refreshing saved prices')
    expect(document.querySelector('.h-10.w-40')).toBeNull()
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled()
  })

  it('lets the user refresh once the cache window has passed', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    vi.mocked(useMarketPrice).mockReturnValue({
      data: {
        slug: 'bitcoin',
        coingeckoId: 'bitcoin',
        currency: 'usd',
        price: 121,
        change24h: 1,
        change7d: 1,
        change1m: 1,
        change1y: 1,
        history: [
          { timestamp: 1, price: 100 },
          { timestamp: 2, price: 121 },
        ],
        cachedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString(),
        stale: true,
      },
      isLoading: false,
      isFetching: false,
      refetch,
      isError: false,
      error: null,
    } as never)

    renderWithProviders(<ProjectPricePanel slug="bitcoin" />)

    await user.click(screen.getByRole('button', { name: 'Refresh' }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
