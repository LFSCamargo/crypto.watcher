import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { ResourceLayout } from '../resource-layout'
import { currentLocation, renderRoutes } from '../../../test/render-routes'

const links = [
  { href: '/guide', label: 'Introduction' },
  { href: '/guide/setup', label: 'Setup' },
  { href: '/guide/faq', label: 'FAQ' },
]

function Article({ title }: { title: string }) {
  return (
    <article>
      <h1>{title}</h1>
      <h2 id="first-part">First part</h2>
      <p>Body</p>
      <h2 id="second-part">Second part</h2>
    </article>
  )
}

const renderGuide = (entry: string, pager = true) =>
  renderRoutes(
    [
      {
        path: '/guide/*',
        element: (
          <ResourceLayout navLabel="Guide" links={links} pager={pager}>
            <Article title={entry} />
          </ResourceLayout>
        ),
      },
    ],
    entry,
  )

describe('ResourceLayout', () => {
  afterEach(cleanup)

  it('marks the current page in a labelled navigation without nesting main', () => {
    const { container } = renderGuide('/guide/setup')

    const nav = screen.getByRole('navigation', { name: 'Guide' })
    expect(within(nav).getByRole('link', { name: 'Setup' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(nav).getByRole('link', { name: 'FAQ' })).not.toHaveAttribute(
      'aria-current',
    )
    expect(container.querySelector('main')).toBeNull()
  })

  it('lists on-page headings as anchor links', async () => {
    renderGuide('/guide/setup')

    const onThisPage = await screen.findByRole('navigation', { name: 'On this page' })
    expect(within(onThisPage).getByRole('link', { name: 'First part' })).toHaveAttribute(
      'href',
      '#first-part',
    )
    expect(within(onThisPage).getByRole('link', { name: 'Second part' })).toHaveAttribute(
      'href',
      '#second-part',
    )
  })

  it('links to the previous and next page in order', () => {
    renderGuide('/guide/setup')

    const pager = screen.getByRole('navigation', { name: 'Guide pages' })
    expect(
      within(pager).getByRole('link', { name: /Previous.*Introduction/ }),
    ).toHaveAttribute('href', '/guide')
    expect(within(pager).getByRole('link', { name: /Next.*FAQ/ })).toHaveAttribute(
      'href',
      '/guide/faq',
    )
  })

  it('omits the pager when disabled', () => {
    renderGuide('/guide/setup', false)
    expect(
      screen.queryByRole('navigation', { name: 'Guide pages' }),
    ).not.toBeInTheDocument()
  })

  it('opens a mobile menu sheet and closes it after navigating', async () => {
    const user = userEvent.setup()
    renderGuide('/guide')

    const trigger = screen.getByRole('button', { name: 'Guide menu' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)

    const sheet = await screen.findByRole('dialog', { name: 'Guide' })
    await user.click(within(sheet).getByRole('link', { name: 'FAQ' }))

    expect(currentLocation()).toBe('/guide/faq')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
