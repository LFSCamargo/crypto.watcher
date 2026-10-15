import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BlogLayout } from '../layouts/blog-layout'
import { renderRoutes } from '../../../test/render-routes'

describe('BlogLayout', () => {
  it('lists every article in the blog navigation and marks the current one', () => {
    renderRoutes([{ path: '/blog/*', element: <BlogLayout /> }], '/blog/launch-story')

    const nav = screen.getByRole('navigation', { name: 'Blog' })
    expect(within(nav).getByRole('link', { name: 'All posts' })).toHaveAttribute(
      'href',
      '/blog',
    )
    const current = within(nav)
      .getAllByRole('link')
      .find((link) => link.getAttribute('href') === '/blog/launch-story')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(
      screen.queryByRole('navigation', { name: 'Blog pages' }),
    ).not.toBeInTheDocument()
  })
})
