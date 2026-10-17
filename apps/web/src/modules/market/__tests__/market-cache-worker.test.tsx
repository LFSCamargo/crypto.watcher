import { useEffect, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { renderWithProviders } from '../../../test/render'
import { loadMarketsProgressively } from '../lib/load-markets-progressively'
import { readLocalMarketCache, writeLocalMarketCache } from '../lib/market-local-cache'
import { MARKET_STALE_TIME_MS, type MarketSnapshot } from '../lib/market.types'
import { MarketCacheWarmup } from '../components/market-cache-warmup'
import { resetMarketCacheWarmup } from '../hooks/use-market-cache-worker'

vi.mock('sonner', () => ({
  toast: { success: vi.fn() },
}))

class MockWorker {
  static latest: MockWorker | null = null

  postMessage = vi.fn()
  terminate = vi.fn()
  private listeners: Array<(event: MessageEvent) => void> = []

  constructor() {
    MockWorker.latest = this
  }

  addEventListener(_type: string, listener: (event: MessageEvent) => void) {
    this.listeners.push(listener)
  }

  removeEventListener(_type: string, listener: (event: MessageEvent) => void) {
    this.listeners = this.listeners.filter((item) => item !== listener)
  }

  emit(data: unknown) {
    for (const listener of this.listeners) listener({ data } as MessageEvent)
  }
}

function snapshot(slug: string, price: number): MarketSnapshot {
  return {
    slug,
    coingeckoId: slug,
    currency: 'usd',
    price,
    change24h: 1,
    change7d: null,
    change1m: null,
    change1y: null,
    history: [
      { timestamp: 1, price: price - 1 },
      { timestamp: 2, price },
    ],
    cachedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + MARKET_STALE_TIME_MS).toISOString(),
  }
}

function ConcurrencyProbe() {
  const [max, setMax] = useState(0)

  useEffect(() => {
    let inflight = 0
    let seen = 0
    const waiting: Array<(value: unknown) => void> = []
    void loadMarketsProgressively(['a', 'b', 'c', 'd'], {
      concurrency: 2,
      fetchSnapshot: () =>
        new Promise((resolve) => {
          inflight += 1
          seen = Math.max(seen, inflight)
          setMax(seen)
          waiting.push((value) => {
            inflight -= 1
            resolve(value)
          })
        }),
      onSnapshot: () => undefined,
    })

    const timer = window.setInterval(() => {
      waiting.shift()?.({ ok: true })
    }, 5)

    return () => window.clearInterval(timer)
  }, [])

  return <p>{`max:${max}`}</p>
}

describe('market cache worker', () => {
  afterEach(() => {
    localStorage.clear()
    resetMarketCacheWarmup()
    MockWorker.latest = null
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('keeps at most a few market fetches in flight', async () => {
    renderWithProviders(<ConcurrencyProbe />)

    await waitFor(() => expect(screen.getByText('max:2')).toBeInTheDocument())
    expect(screen.queryByText('max:4')).not.toBeInTheDocument()
  })

  it('stores each token from the worker and toasts in dev only after every one is saved', async () => {
    vi.stubGlobal('Worker', MockWorker)

    renderWithProviders(<MarketCacheWarmup slugs={['bitcoin', 'ethereum']} />)

    const worker = MockWorker.latest
    expect(worker).not.toBeNull()
    expect(worker?.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ slugs: ['bitcoin', 'ethereum'] }),
    )

    act(() => {
      worker?.emit({ type: 'snapshot', snapshot: snapshot('bitcoin', 42000) })
    })
    expect(readLocalMarketCache('bitcoin')?.price).toBe(42000)
    expect(readLocalMarketCache('ethereum')).toBeNull()
    expect(toast.success).not.toHaveBeenCalled()

    const progress = await screen.findByRole('progressbar', { name: 'Market prices saved locally' })
    expect(progress).toHaveAttribute('aria-valuenow', '1')
    expect(progress).toHaveAttribute('aria-valuemax', '2')
    expect(screen.getByRole('list', { name: 'Saved' })).toHaveTextContent('Bitcoin')
    expect(screen.getByRole('list', { name: 'Still loading' })).toHaveTextContent('Ethereum')
    expect(screen.getByRole('list', { name: 'Still loading' })).not.toHaveTextContent('Bitcoin')

    act(() => {
      worker?.emit({ type: 'complete' })
    })
    expect(toast.success).not.toHaveBeenCalled()

    act(() => {
      worker?.emit({ type: 'snapshot', snapshot: snapshot('ethereum', 3200) })
      worker?.emit({ type: 'complete' })
    })

    expect(readLocalMarketCache('ethereum')?.price).toBe(3200)
    expect(toast.success).toHaveBeenCalledWith('All market prices are saved locally')
    await waitFor(() =>
      expect(screen.queryByRole('progressbar', { name: 'Market prices saved locally' })).not.toBeInTheDocument(),
    )
  })

  it('does not ask the worker for a token that is already saved', () => {
    writeLocalMarketCache('bitcoin', snapshot('bitcoin', 42000))
    vi.stubGlobal('Worker', MockWorker)

    renderWithProviders(<MarketCacheWarmup slugs={['bitcoin', 'ethereum']} />)

    expect(MockWorker.latest?.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ slugs: ['ethereum'] }),
    )
  })
})
