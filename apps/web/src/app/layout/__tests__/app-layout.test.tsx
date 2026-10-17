import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import { AppLayout } from '../app-layout'

vi.mock('../../../lib/seo', () => ({ RouteSeo: () => null }))
vi.mock('../../../modules/auth/hooks/use-session', () => ({
  useSessionBootstrap: () => undefined,
}))
vi.mock('../../../components/search/command-palette', () => ({
  CommandPalette: () => null,
}))
vi.mock('../../../components/layout/app-header', () => ({ AppHeader: () => null }))
vi.mock('../../../components/layout/mobile-navigation', () => ({
  MobileNavigation: () => null,
}))
vi.mock('../../../modules/market/components/market-cache-warmup', () => ({
  MarketCacheWarmup: () => null,
}))

afterEach(cleanup)

it.each(['/', '/app', '/app/governance', '/app/reference/bitcoin', '/docs', '/blog'])(
  'reserves safe-area bottom-pill clearance on %s',
  (path) => {
    const { container } = render(
      <MemoryRouter initialEntries={[path]}>
        <AppLayout />
      </MemoryRouter>,
    )
    expect(screen.getByRole('main')).toHaveClass(
      'pb-[calc(7rem+env(safe-area-inset-bottom))]',
      'min-w-0',
      '[overflow-wrap:anywhere]',
    )
    expect(container.querySelector('footer')).toHaveClass(
      'pb-[calc(7rem+env(safe-area-inset-bottom))]',
    )
  },
)
