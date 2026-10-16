import { cleanup, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ReferenceProjectDetailPage } from '../pages/reference-project-detail-page'
import { mockApi } from '../../../test/mock-api'
import { renderRoutes } from '../../../test/render-routes'

const renderReference = (slug: string) =>
  renderRoutes(
    [{ path: '/app/reference/:slug', element: <ReferenceProjectDetailPage /> }],
    `/app/reference/${slug}`,
  )

describe('ReferenceProjectDetailPage', () => {
  afterEach(() => {
    cleanup()
  })

  it('identifies the page as a reference assessment, not a council report', () => {
    mockApi({})
    renderReference('bitcoin')

    expect(screen.getByRole('heading', { level: 1, name: 'Bitcoin' })).toBeInTheDocument()
    const notice = screen.getByRole('note', { name: 'Reference assessment' })
    expect(notice).toHaveTextContent(/not a governor council report/i)
    expect(
      screen.queryByText(/Reviewed safe|Expert council score/),
    ).not.toBeInTheDocument()
  })

  it('labels the index as a reference index with its meaning', () => {
    mockApi({})
    renderReference('bitcoin')

    const index = screen.getByRole('region', { name: 'Reference index' })
    expect(within(index).getByText(/Higher is safer/)).toBeInTheDocument()
    expect(within(index).getByText(/Not financial advice/)).toBeInTheDocument()
  })

  it('does not promote trading venues', () => {
    mockApi({})
    renderReference('bitcoin')

    expect(screen.queryByText(/Recommended to trade on/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Coinbase' })).not.toBeInTheDocument()
  })

  it('offers a council review request instead of an evidence form that does not exist', () => {
    mockApi({})
    renderReference('bitcoin')

    expect(
      screen.getByRole('link', { name: 'Request a council review' }),
    ).toHaveAttribute('href', '/app/analysis-request')
    expect(screen.queryByText(/Submit evidence/)).not.toBeInTheDocument()
  })

  it('shows a not-found state for unknown reference slugs', () => {
    mockApi({})
    renderReference('nope')

    expect(
      screen.getByRole('heading', { name: 'Reference assessment not found' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to projects' })).toHaveAttribute(
      'href',
      '/app',
    )
  })
})
