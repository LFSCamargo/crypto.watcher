import { screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../../../lib/api/client'
import { renderWithProviders } from '../../../test/render'
import { useMarketPrice } from '../hooks/use-market-price'
import {
  MARKET_CACHE_LIMIT,
  MARKET_HYDRATION_POINTS,
  readLocalMarketCache,
  writeLocalMarketCache,
} from '../lib/market-local-cache'
import { MARKET_RETENTION_MS, MARKET_STALE_TIME_MS, type MarketSnapshot } from '../lib/market.types'

vi.mock('../../../lib/api/client', () => ({
  apiFetch: vi.fn(),
}))

function PriceProbe({ slug }: { slug: string }) {
  const { data, isLoading, isError } = useMarketPrice(slug)
  return (
    <div>
      <p>{isLoading ? 'loading' : 'ready'}</p>
      <p>{isError ? 'error' : 'ok'}</p>
      <p>{data ? `price:${data.price}` : 'empty'}</p>
      {data?.stale ? <p>stale</p> : null}
    </div>
  )
}

function snapshot(slug: string, price: number, points = 4): MarketSnapshot {
  return {
    slug,
    coingeckoId: slug,
    currency: 'usd',
    price,
    change24h: 1,
    change7d: 2,
    change1m: 3,
    change1y: 4,
    history: Array.from({ length: points }, (_, index) => ({
      timestamp: index + 1,
      price: price + index,
    })),
    cachedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + MARKET_STALE_TIME_MS).toISOString(),
  }
}

describe('market price hydration', () => {
  afterEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('shows a saved price immediately, then replaces it when a fresher snapshot arrives', async () => {
    const saved = snapshot('bitcoin', 42000, 200)
    saved.cachedAt = new Date(Date.now() - MARKET_STALE_TIME_MS - 1000).toISOString()
    saved.expiresAt = new Date(Date.now() - 1000).toISOString()
    writeLocalMarketCache('bitcoin', saved)

    const stored = readLocalMarketCache('bitcoin')
    expect(stored?.history).toHaveLength(MARKET_HYDRATION_POINTS)
    expect(stored?.history[0]?.price).toBe(42000)
    expect(stored?.history.at(-1)?.price).toBe(42199)

    let resolveFetch: (value: MarketSnapshot) => void = () => undefined
    vi.mocked(apiFetch).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )

    renderWithProviders(<PriceProbe slug="bitcoin" />)

    expect(screen.getByText('ready')).toBeInTheDocument()
    expect(screen.getByText('price:42000')).toBeInTheDocument()
    expect(screen.getByText('stale')).toBeInTheDocument()

    resolveFetch(snapshot('bitcoin', 43000))

    await waitFor(() => expect(screen.getByText('price:43000')).toBeInTheDocument())
    expect(screen.queryByText('stale')).not.toBeInTheDocument()
    expect(readLocalMarketCache('bitcoin')?.price).toBe(43000)
  })

  it('keeps a fresh snapshot on screen without asking the network again', () => {
    writeLocalMarketCache('bitcoin', snapshot('bitcoin', 51000))
    renderWithProviders(<PriceProbe slug="bitcoin" />)

    expect(screen.getByText('price:51000')).toBeInTheDocument()
    expect(screen.queryByText('stale')).not.toBeInTheDocument()
    expect(apiFetch).not.toHaveBeenCalled()
  })

  it('forgets the oldest snapshot once the saved set is full', () => {
    for (let index = 0; index <= MARKET_CACHE_LIMIT; index += 1) {
      writeLocalMarketCache(`coin-${index}`, snapshot(`coin-${index}`, 100 + index))
    }

    expect(readLocalMarketCache('coin-0')).toBeNull()
    expect(readLocalMarketCache(`coin-${MARKET_CACHE_LIMIT}`)?.price).toBe(
      100 + MARKET_CACHE_LIMIT,
    )

    renderWithProviders(<PriceProbe slug={`coin-${MARKET_CACHE_LIMIT}`} />)
    expect(screen.getByText(`price:${100 + MARKET_CACHE_LIMIT}`)).toBeInTheDocument()
  })

  it('keeps showing a saved price from the last week when the refresh fails', async () => {
    const saved = snapshot('bitcoin', 42000)
    saved.cachedAt = new Date(Date.now() - MARKET_STALE_TIME_MS - 1000).toISOString()
    saved.expiresAt = new Date(Date.now() - 1000).toISOString()
    writeLocalMarketCache('bitcoin', saved)
    vi.mocked(apiFetch).mockRejectedValue(new Error('API 500: upstream'))

    renderWithProviders(<PriceProbe slug="bitcoin" />)

    expect(screen.getByText('price:42000')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('stale')).toBeInTheDocument())
    expect(screen.getByText('ok')).toBeInTheDocument()
  })

  it('shows an error once the saved snapshot is older than a week', async () => {
    const saved = snapshot('bitcoin', 42000)
    saved.cachedAt = new Date(Date.now() - MARKET_RETENTION_MS - 1000).toISOString()
    saved.expiresAt = saved.cachedAt
    writeLocalMarketCache('bitcoin', saved)
    expect(readLocalMarketCache('bitcoin')).toBeNull()
    vi.mocked(apiFetch).mockRejectedValue(new Error('API 500: upstream'))

    renderWithProviders(<PriceProbe slug="bitcoin" />)

    await waitFor(() => expect(screen.getByText('error')).toBeInTheDocument())
    expect(screen.getByText('empty')).toBeInTheDocument()
  })
})
