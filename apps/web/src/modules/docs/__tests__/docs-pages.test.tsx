import { cleanup, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  DocsFAQ,
  DocsGovernance,
  DocsIntroduction,
  DocsLayout,
  DocsTokenomics,
} from '../routes'
import { renderRoutes } from '../../../test/render-routes'

const renderDocs = (entry: string) =>
  renderRoutes(
    [
      {
        path: '/docs/*',
        element: <DocsLayout />,
      },
    ],
    entry,
  )

const renderPage = (element: React.ReactElement) =>
  renderRoutes([{ path: '/docs/page', element }], '/docs/page')

describe('Documentation', () => {
  afterEach(cleanup)

  it('exposes the documentation navigation', () => {
    renderDocs('/docs')
    const nav = screen.getByRole('navigation', { name: 'Documentation' })
    for (const label of [
      'Introduction',
      'Whitepaper',
      'Tokenomics',
      'Governance',
      'FAQ',
    ]) {
      expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument()
    }
  })

  it('gives every section heading a stable anchor', () => {
    renderPage(<DocsFAQ />)

    const heading = screen.getByRole('heading', { level: 2, name: 'Reviews & Scores' })
    expect(heading).toHaveAttribute('id', 'reviews-scores')
    const section = screen.getByRole('region', { name: 'Reviews & Scores' })
    expect(
      within(section).getByRole('link', { name: 'Link to Reviews & Scores' }),
    ).toHaveAttribute('href', '#reviews-scores')
  })

  it('describes participation that the product supports today', () => {
    renderPage(<DocsFAQ />)

    expect(screen.queryByText(/paid review/i)).not.toBeInTheDocument()
    expect(screen.getByText(/free during launch/i)).toBeInTheDocument()
    expect(
      screen.getAllByText(/Share evidence and sources in project comments/).length,
    ).toBeGreaterThan(0)
  })

  it('explains that governance votes and delegation happen in a wallet for now', () => {
    renderPage(<DocsGovernance />)

    expect(screen.queryByText(/Click "Delegate"/)).not.toBeInTheDocument()
    expect(
      screen.getAllByText(/in-app voting and delegation are not available yet/i).length,
    ).toBeGreaterThan(0)
  })

  it('keeps the introduction aligned with the review lifecycle', () => {
    renderPage(<DocsIntroduction />)

    expect(
      screen.queryByText(/submit evidence and report incidents/i),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse projects' })).toHaveAttribute(
      'href',
      '/app',
    )
  })

  it('lets keyboard users scroll wide tables', () => {
    renderPage(<DocsTokenomics />)

    const table = screen.getByRole('region', { name: 'Token Distribution table' })
    expect(table).toHaveAttribute('tabindex', '0')
    expect(within(table).getByRole('table')).toBeInTheDocument()
    expect(screen.getByText(/Review requests are free during launch/)).toBeInTheDocument()
  })
})
