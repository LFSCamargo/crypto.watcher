import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HeroSection } from '../components/hero-section'
import { renderWithProviders } from '../../../test/render'
import { useCommandPaletteStore } from '../../../store/command-palette'

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: matches && query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

describe('HeroSection', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify([]), { status: 200 })),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    useCommandPaletteStore.setState({ open: false })
  })

  it('puts a decorative scope in the middle of the sonar', () => {
    stubReducedMotion(false)
    renderWithProviders(<HeroSection />)
    const stage = document.querySelector('[data-hero-stage]')
    const core = stage?.querySelector('[data-radar-core]')
    expect(core?.querySelector('img')?.getAttribute('src')).toBe('/logo.png')
    expect(core?.querySelector('.animate-sonar-bloom')).toBeTruthy()
    expect(core?.querySelector('.animate-reticle')).toBeTruthy()
    expect(stage?.querySelector('.animate-radar-drift')).toBeTruthy()
    expect(stage?.querySelector('[data-keep-upright]')).toHaveStyle({
      transform: 'rotate(-42deg)',
    })
    expect(
      screen.queryByRole('figure', { name: /Illustrative report preview/ }),
    ).not.toBeInTheDocument()
  })

  it('keeps the sonar off small screens', () => {
    stubReducedMotion(false)
    renderWithProviders(<HeroSection />)
    const stage = document.querySelector('[data-hero-stage]')
    expect(stage).toHaveClass('hidden', 'lg:flex')
    expect(stage?.querySelector('[data-radar-core]')).toBeTruthy()
  })

  it('links every radar asset to its reference assessment', () => {
    stubReducedMotion(false)
    renderWithProviders(<HeroSection />)
    const assets = screen.getByRole('list', { name: 'Featured reference assessments' })
    const links = within(assets).getAllByRole('link')
    expect(links.length).toBeGreaterThan(10)
    expect(within(assets).getByRole('link', { name: /Bitcoin/ })).toHaveAttribute(
      'href',
      '/app/reference/bitcoin',
    )
    const bitcoin = within(assets).getByRole('link', { name: /Bitcoin/ }).closest('li')
    const watched = within(assets).getByRole('link', { name: /Polygon/ }).closest('li')
    expect(Number(watched?.getAttribute('data-radius'))).toBeLessThan(
      Number(bitcoin?.getAttribute('data-radius')),
    )
    for (const link of links) {
      expect(link.getAttribute('href')).toMatch(/^\/app\/reference\/[a-z0-9-]+$/)
      expect(link).toHaveAccessibleName(/reference assessment$/)
    }
  })

  it('previews protocol details when a radar asset is hovered', async () => {
    stubReducedMotion(false)
    const user = userEvent.setup()
    renderWithProviders(<HeroSection />)
    const link = screen.getByRole('link', { name: 'Uniswap reference assessment' })
    await user.hover(link)
    expect(link.closest('li')).toHaveAttribute('data-paused', 'true')
    expect(link.closest('li')?.querySelector('.animate-radar-drift')).toHaveClass(
      '[animation-play-state:paused]',
    )
    expect(await screen.findByRole('heading', { name: 'Uniswap' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Reference index' })).toHaveTextContent('93')

    const scroller = document.querySelector('[data-preview-scroll]') as HTMLElement
    Object.defineProperty(scroller, 'scrollHeight', { configurable: true, value: 640 })
    Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 220 })
    Object.defineProperty(scroller, 'scrollTop', { configurable: true, value: 80 })
    fireEvent.scroll(scroller)
    const indicator = document.querySelector('[data-scroll-indicator]')
    expect(indicator?.querySelector('div')?.getAttribute('style')).toMatch(/top: .+%/)
  })

  it('opens the global search instead of an inline search field', async () => {
    stubReducedMotion(false)
    const user = userEvent.setup()
    renderWithProviders(<HeroSection />)
    const hero = screen.getByRole('region', { name: /Is this crypto project safe/ })
    expect(within(hero).queryByRole('combobox')).not.toBeInTheDocument()
    expect(within(hero).queryByRole('searchbox')).not.toBeInTheDocument()
    await user.click(within(hero).getByRole('button', { name: /Search a project/ }))
    expect(useCommandPaletteStore.getState().open).toBe(true)
  })
})
