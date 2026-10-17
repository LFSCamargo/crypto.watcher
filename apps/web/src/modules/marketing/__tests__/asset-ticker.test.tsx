import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { AssetTicker } from '../components/asset-ticker'
import { renderWithProviders } from '../../../test/render'

describe('AssetTicker', () => {
  afterEach(cleanup)

  it('is a decorative, mouse-only tape of links to reference pages', () => {
    const { container } = renderWithProviders(<AssetTicker />)
    const tape = container.querySelector('[data-ticker]')
    expect(tape).toHaveAttribute('aria-hidden', 'true')

    const links = tape?.querySelectorAll('a') ?? []
    expect(links.length).toBeGreaterThan(10)
    for (const link of links) {
      expect(link).toHaveAttribute('tabindex', '-1')
      expect(link.getAttribute('href')).toMatch(/^\/app\/reference\//)
    }
    expect(screen.queryAllByRole('link').some((link) => tape?.contains(link))).toBe(false)
  })

  it('shows a contained banner carousel instead of the sonar on small screens', () => {
    renderWithProviders(<AssetTicker />)
    const banners = screen.getByRole('list', { name: 'Reference banners' })
    expect(banners).toHaveClass('overflow-x-auto', 'snap-x', 'max-w-full')
    const links = within(banners).getAllByRole('link')
    expect(links.length).toBeGreaterThan(3)
    expect(links.length).toBeLessThan(16)
    for (const link of links) {
      expect(link.getAttribute('href')).toMatch(/^\/app\/reference\//)
      expect(link).toHaveAccessibleName(/reference assessment/)
    }
  })

  it('opens the radar-style preview when a coin avatar is hovered', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<AssetTicker />)
    const tape = container.querySelector('[data-ticker]')
    const link = tape?.querySelector('a[href="/app/reference/usd-coin"]')
    expect(link).toBeInstanceOf(HTMLAnchorElement)

    await user.hover(link as HTMLAnchorElement)

    const heading = await screen.findByRole('heading', { name: 'USDC' })
    const content = heading.closest('[data-state]')
    expect(content).toHaveAttribute('data-state', 'open')
    expect(screen.getByRole('group', { name: 'Reference index' })).toHaveTextContent('97')
    await waitFor(() => {
      expect(container.querySelector('[data-ticker]')).toHaveAttribute(
        'data-preview-open',
        'true',
      )
    })
  })

  it('keeps the tape passing and lets the wheel scrub it while hovered', () => {
    const { container } = renderWithProviders(<AssetTicker />)
    const tape = container.querySelector('[data-ticker]') as HTMLElement
    expect(tape).toBeTruthy()
    Object.defineProperty(tape, 'scrollWidth', { configurable: true, value: 2000 })
    Object.defineProperty(tape, 'clientWidth', { configurable: true, value: 400 })

    tape.scrollLeft = 20
    fireEvent.wheel(tape, { deltaY: 40, deltaX: 0 })
    expect(tape.scrollLeft).toBe(20)

    fireEvent.pointerEnter(tape)
    fireEvent.wheel(tape, { deltaY: 40, deltaX: 0 })
    expect(tape.scrollLeft).toBe(60)
  })
})
