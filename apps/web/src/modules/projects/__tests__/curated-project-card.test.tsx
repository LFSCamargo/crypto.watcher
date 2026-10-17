import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/render'
import { CuratedProjectCard } from '../components/curated-project-card'
import { getCuratedProject } from '../lib/curated-projects'
import { useMarketPrice } from '../../market/hooks/use-market-price'

vi.mock('../../market/hooks/use-market-price', () => ({
  useMarketPrice: vi.fn(() => ({
    data: {
      slug: 'bitcoin',
      coingeckoId: 'bitcoin',
      currency: 'usd' as const,
      price: 50000,
      change24h: 1.2,
      change7d: 3.4,
      change1m: 8.1,
      change1y: 45.2,
      history: [
        { timestamp: 1, price: 48000 },
        { timestamp: 2, price: 50000 },
      ],
      cachedAt: '2024-01-01T00:00:00.000Z',
      expiresAt: '2024-01-01T03:00:00.000Z',
    },
    isLoading: false,
    isError: false,
    error: null,
  })),
}))

const mockedUseMarketPrice = vi.mocked(useMarketPrice)

describe('CuratedProjectCard', () => {
  beforeEach(() => {
    mockedUseMarketPrice.mockReset()
    mockedUseMarketPrice.mockReturnValue({
      data: {
        slug: 'bitcoin',
        coingeckoId: 'bitcoin',
        currency: 'usd' as const,
        price: 50000,
        change24h: 1.2,
        change7d: 3.4,
        change1m: 8.1,
        change1y: 45.2,
        history: [
          { timestamp: 1, price: 48000 },
          { timestamp: 2, price: 50000 },
        ],
        cachedAt: '2024-01-01T00:00:00.000Z',
        expiresAt: '2024-01-01T03:00:00.000Z',
      },
      isLoading: false,
      isError: false,
      error: null,
    } as never)

    class IntersectionObserverMock {
      private readonly callback: IntersectionObserverCallback

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback
      }

      observe = vi.fn(() => {
        this.callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          this as never,
        )
      })

      disconnect = vi.fn()
      unobserve = vi.fn()
    }

    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
  })

  it('renders curated project details and market changes', () => {
    const project = getCuratedProject('bitcoin')
    expect(project).toBeDefined()

    renderWithProviders(<CuratedProjectCard index={0} project={project!} />)

    expect(screen.getByRole('link', { name: /Bitcoin/i })).toBeInTheDocument()
    expect(screen.getByText('Lower risk')).toBeInTheDocument()
    expect(screen.getByText('Reference assessment')).toBeInTheDocument()
    expect(
      screen.queryByText(/Reviewed safe|Expert safety review/),
    ).not.toBeInTheDocument()
    expect(screen.getByText('$50,000.00')).toBeInTheDocument()
  })

  it('shows watch status and negative market changes', () => {
    mockedUseMarketPrice.mockImplementation((slug?: string) => {
      if (slug !== 'xrp') {
        return { data: undefined, isLoading: false, isError: false, error: null } as never
      }

      return {
        data: {
          slug: 'xrp',
          coingeckoId: 'ripple',
          currency: 'usd',
          price: 0.55,
          change24h: -2.4,
          change7d: -5.1,
          change1m: null,
          change1y: -12.3,
          history: [
            { timestamp: 1, price: 0.6 },
            { timestamp: 2, price: 0.55 },
          ],
          cachedAt: '2024-01-01T00:00:00.000Z',
          expiresAt: '2024-01-01T03:00:00.000Z',
        },
        isLoading: false,
        isError: false,
        error: null,
      } as never
    })

    const project = getCuratedProject('xrp')
    renderWithProviders(<CuratedProjectCard index={1} project={project!} />)

    expect(screen.getByText('Under watch')).toBeInTheDocument()
    expect(screen.getByText('-2.40%')).toBeInTheDocument()
  })

  it('shows loading skeletons while market data is fetching', () => {
    mockedUseMarketPrice.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as never)

    const project = getCuratedProject('bitcoin')
    renderWithProviders(
      <CuratedProjectCard index={0} project={project!} fetchImmediately />,
    )

    expect(screen.getByLabelText('Loading market data')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Bitcoin/i })).toHaveAttribute(
      'aria-busy',
      'true',
    )
    expect(screen.queryByText(/Live price data unavailable/i)).not.toBeInTheDocument()
  })

  it('renders a rich chart when requested', () => {
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 320,
      height: 64,
      top: 0,
      left: 0,
      right: 320,
      bottom: 64,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }))

    const project = getCuratedProject('ethereum')
    renderWithProviders(<CuratedProjectCard index={0} project={project!} richChart />)

    expect(screen.getByRole('img', { name: /Price chart/i })).toBeInTheDocument()
  })

  it('keeps the saved price visible while a refresh is in flight', () => {
    mockedUseMarketPrice.mockReturnValue({
      data: {
        slug: 'bitcoin',
        coingeckoId: 'bitcoin',
        currency: 'usd',
        price: 50000,
        change24h: 1.2,
        change7d: 3.4,
        change1m: 8.1,
        change1y: 45.2,
        history: [
          { timestamp: 1, price: 48000 },
          { timestamp: 2, price: 50000 },
        ],
        cachedAt: '2024-01-01T00:00:00.000Z',
        expiresAt: '2024-01-01T03:00:00.000Z',
      },
      isLoading: false,
      isFetching: true,
      isError: false,
      error: null,
    } as never)

    const project = getCuratedProject('bitcoin')
    renderWithProviders(<CuratedProjectCard index={0} project={project!} />)

    expect(screen.getByText('$50,000.00')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Refreshing saved price')
    expect(screen.queryByLabelText('Loading market data')).not.toBeInTheDocument()
  })
})
