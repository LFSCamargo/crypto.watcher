import { cleanup, screen } from '@testing-library/react'
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
})
