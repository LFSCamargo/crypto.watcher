import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { Link } from 'react-router-dom'
import { ProjectsPage } from '../pages/projects-page'
import { curatedProjects, filterCuratedProjects } from '../lib/curated-projects'
import { mockApi } from '../../../test/mock-api'
import { currentLocation, renderRoutes } from '../../../test/render-routes'

const councilProjects = [
  {
    id: 'p1',
    slug: 'aave',
    name: 'Aave',
    description: 'Lending protocol',
    chainId: 1,
    state: 'analyzed',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'p2',
    slug: 'nova-dex',
    name: 'Nova DEX',
    description: 'Experimental exchange',
    chainId: 1,
    state: 'in_analysis',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
]

const renderCatalog = (entry = '/app') =>
  renderRoutes([{ path: '/app', element: <ProjectsPage /> }], entry)

describe('ProjectsPage', () => {
  afterEach(() => {
    cleanup()
  })

  it('lists council projects before reference assessments and labels each group', async () => {
    mockApi({ 'GET /projects': [200, councilProjects] })
    renderCatalog()

    const council = await screen.findByRole('region', { name: 'Council projects' })
    const references = screen.getByRole('region', { name: 'Reference assessments' })
    expect(council.compareDocumentPosition(references)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(
      await within(council).findByRole('heading', { name: 'Aave' }),
    ).toBeInTheDocument()
    expect(
      within(references).getByText(/not governor council reports/i),
    ).toBeInTheDocument()
    expect(
      within(references).getByText(`${curatedProjects.length} reference assessments`),
    ).toBeInTheDocument()
    expect(screen.queryByText(/safe projects/i)).not.toBeInTheDocument()
  })

  it('pages reference assessments with a show-more control', async () => {
    mockApi({ 'GET /projects': [200, []] })
    const user = userEvent.setup()
    renderCatalog()

    const references = screen.getByRole('region', { name: 'Reference assessments' })
    expect(within(references).getAllByRole('link')).toHaveLength(24)
    expect(
      within(references).getByText(`Showing 24 of ${curatedProjects.length}`),
    ).toBeInTheDocument()

    await user.click(within(references).getByRole('button', { name: 'Show more' }))
    expect(within(references).getAllByRole('link')).toHaveLength(48)
  })

  it('keeps the search in the URL without adding history entries per keystroke', async () => {
    mockApi({ 'GET /projects': [200, councilProjects] })
    const user = userEvent.setup()
    renderCatalog()

    await user.type(screen.getByRole('searchbox', { name: 'Search projects' }), 'nova')
    await waitFor(() => expect(currentLocation()).toBe('/app?search=nova'))

    const council = screen.getByRole('region', { name: 'Council projects' })
    expect(within(council).getByRole('heading', { name: 'Nova DEX' })).toBeInTheDocument()
    expect(
      within(council).queryByRole('heading', { name: 'Aave' }),
    ).not.toBeInTheDocument()
  })

  it('restores filters from the URL and exposes pressed state on category chips', async () => {
    mockApi({ 'GET /projects': [200, []] })
    renderCatalog('/app?category=defi&search=uni')

    expect(screen.getByRole('searchbox', { name: 'Search projects' })).toHaveValue('uni')
    const filters = screen.getByRole('group', {
      name: 'Filter reference assessments by category',
    })
    expect(within(filters).getByRole('button', { name: 'DeFi' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(filters).getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(await screen.findByRole('link', { name: /Uniswap/ })).toBeInTheDocument()
  })

  it('follows search changes made elsewhere, such as the header search', async () => {
    mockApi({ 'GET /projects': [200, []] })
    const user = userEvent.setup()
    renderRoutes(
      [
        {
          path: '/app',
          element: (
            <>
              <Link to="/app?search=solana">Header result</Link>
              <ProjectsPage />
            </>
          ),
        },
      ],
      '/app',
    )

    await user.click(screen.getByRole('link', { name: 'Header result' }))
    expect(screen.getByRole('searchbox', { name: 'Search projects' })).toHaveValue(
      'solana',
    )
    expect(
      (await screen.findAllByRole('link', { name: /Solana/ })).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByText(`${filterCuratedProjects('solana').length} reference assessments`),
    ).toBeInTheDocument()
  })

  it('updates the category in the URL when a chip is chosen', async () => {
    mockApi({ 'GET /projects': [200, []] })
    const user = userEvent.setup()
    renderCatalog()

    await user.click(screen.getByRole('button', { name: 'Stablecoin' }))
    expect(currentLocation()).toBe('/app?category=stablecoin')
    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(currentLocation()).toBe('/app')
  })

  it('offers a reset when no reference assessment matches', async () => {
    mockApi({ 'GET /projects': [200, []] })
    const user = userEvent.setup()
    renderCatalog('/app?search=zzzz-no-match&category=nft')

    expect(
      screen.getByText('No reference assessments match your filters.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(currentLocation()).toBe('/app')
    expect(screen.getByRole('searchbox', { name: 'Search projects' })).toHaveValue('')
  })

  it('explains an empty council list and links to a review request', async () => {
    mockApi({ 'GET /projects': [200, []] })
    renderCatalog()

    const council = screen.getByRole('region', { name: 'Council projects' })
    expect(
      await within(council).findByText('No council projects yet.'),
    ).toBeInTheDocument()
    expect(
      within(council).getByRole('link', { name: 'Request a review' }),
    ).toHaveAttribute('href', '/app/analysis-request')
  })

  it('reports a council list failure without hiding reference assessments', async () => {
    const fetchMock = mockApi({ 'GET /projects': [500, { message: 'boom' }] })
    const user = userEvent.setup()
    renderCatalog()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Council projects couldn't be loaded.",
    )
    expect(
      screen.getByRole('region', { name: 'Reference assessments' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
  })
})
