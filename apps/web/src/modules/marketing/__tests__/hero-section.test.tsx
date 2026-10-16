import { cleanup, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HeroSection } from '../components/hero-section'
import { renderWithProviders } from '../../../test/render'

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

  it('keeps the orbiting assets decorative', () => {
    stubReducedMotion(false)
    renderWithProviders(<HeroSection />)
    const hero = screen.getByRole('region', { name: /Is this crypto project safe/ })
    expect(within(hero).queryAllByRole('img')).toHaveLength(0)
    expect(hero.querySelectorAll('[data-orbit-asset]').length).toBeGreaterThan(0)
  })
})
