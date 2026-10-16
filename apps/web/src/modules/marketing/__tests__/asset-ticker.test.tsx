import { cleanup, screen, waitFor } from '@testing-library/react'
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
    expect(screen.queryAllByRole('link')).toHaveLength(0)
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
})
