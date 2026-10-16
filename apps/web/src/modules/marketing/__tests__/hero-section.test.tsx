import { cleanup, screen, waitFor, within } from '@testing-library/react'
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

function animatedScore() {
  const preview = screen.getByRole('figure', { name: /Illustrative report preview/ })
  const score = preview.querySelector('[data-score]')
  if (!score) throw new Error('Animated score not rendered')
  return score
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

  it('counts the example score up to its final value', async () => {
    stubReducedMotion(false)
    renderWithProviders(<HeroSection />)
    expect(Number(animatedScore().textContent)).toBeLessThan(82)
    await waitFor(() => expect(animatedScore()).toHaveTextContent('82'), {
      timeout: 4000,
    })
  })

  it('shows the final score immediately when motion is reduced', () => {
    stubReducedMotion(true)
    renderWithProviders(<HeroSection />)
    expect(animatedScore()).toHaveTextContent('82')
  })

  it('announces the final score instead of the counting digits', () => {
    stubReducedMotion(false)
    renderWithProviders(<HeroSection />)
    const preview = screen.getByRole('figure', { name: /Illustrative report preview/ })
    expect(animatedScore()).toHaveAttribute('aria-hidden', 'true')
    expect(within(preview).getByText('Example score: 82 out of 100')).toHaveClass(
      'sr-only',
    )
  })

  it('links every radar asset to its reference assessment', () => {
    stubReducedMotion(false)
    renderWithProviders(<HeroSection />)
    const assets = screen.getByRole('list', { name: 'Featured reference assessments' })
    const links = within(assets).getAllByRole('link')
    expect(links).toHaveLength(6)
    expect(within(assets).getByRole('link', { name: /Bitcoin/ })).toHaveAttribute(
      'href',
      '/app/reference/bitcoin',
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
    await user.hover(screen.getByRole('link', { name: 'Uniswap reference assessment' }))
    expect(await screen.findByRole('heading', { name: 'Uniswap' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Reference index' })).toHaveTextContent('93')
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
