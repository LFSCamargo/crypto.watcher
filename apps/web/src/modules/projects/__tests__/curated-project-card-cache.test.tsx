import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { apiFetch } from '../../../lib/api/client'
import { renderWithProviders } from '../../../test/render'
import { writeLocalMarketCache } from '../../market/lib/market-local-cache'
import { MARKET_STALE_TIME_MS, type MarketSnapshot } from '../../market/lib/market.types'
import { CuratedProjectCard } from '../components/curated-project-card'
import { getCuratedProject } from '../lib/curated-projects'

vi.mock('../../../lib/api/client', () => ({
  apiFetch: vi.fn(),
}))

function snapshot(slug: string, price: number): MarketSnapshot {
  return {
    slug,
    coingeckoId: slug,
    currency: 'usd',
    price,
    change24h: 1,
    change7d: 2,
    change1m: 3,
    change1y: 4,
    history: [
      { timestamp: 1, price: price - 1 },
      { timestamp: 2, price },
    ],
    cachedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + MARKET_STALE_TIME_MS).toISOString(),
  }
}

describe('CuratedProjectCard saved prices', () => {
  afterEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('paints each saved token before the card is on screen and does not refetch it', () => {
    writeLocalMarketCache('bitcoin', snapshot('bitcoin', 42000))
    writeLocalMarketCache('ethereum', snapshot('ethereum', 3200))

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn()
        disconnect = vi.fn()
        unobserve = vi.fn()
      },
    )

    const bitcoin = getCuratedProject('bitcoin')
    const ethereum = getCuratedProject('ethereum')
    renderWithProviders(
      <>
        <CuratedProjectCard index={0} project={bitcoin!} />
        <CuratedProjectCard index={1} project={ethereum!} />
      </>,
    )

    expect(screen.getByText('$42,000.00')).toBeInTheDocument()
    expect(screen.getByText('$3,200.00')).toBeInTheDocument()
    expect(screen.queryByLabelText('Loading market data')).not.toBeInTheDocument()
    expect(apiFetch).not.toHaveBeenCalled()
  })
})
