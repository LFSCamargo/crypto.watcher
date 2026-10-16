import { cleanup, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ProjectDetailPage } from '../pages/project-detail-page'
import { mockApi } from '../../../test/mock-api'
import { renderRoutes } from '../../../test/render-routes'
import { useSession } from '../../../store/session'

const aave = {
  id: 'p1',
  slug: 'aave',
  name: 'Aave',
  description: 'Lending protocol',
  chainId: 1,
  state: 'analyzed',
  votingContractAddress: '0x1111111111111111111111111111111111111111',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const nova = {
  ...aave,
  id: 'p2',
  slug: 'nova-dex',
  name: 'Nova DEX',
  description: 'Experimental exchange',
  state: 'in_analysis',
  votingContractAddress: null,
}

const score = {
  projectId: 'p1',
  round: 3,
  value: '8200',
  breakdown: { weightFor: '82', weightAgainst: '18', totalWeight: '100' },
  creditRating: { sp: 'A', moodys: 'A', group: 'investment_grade' },
}

const renderDetail = (slug: string) =>
  renderRoutes(
    [{ path: '/app/projects/:slug', element: <ProjectDetailPage /> }],
    `/app/projects/${slug}`,
  )

describe('ProjectDetailPage', () => {
  afterEach(() => {
    cleanup()
    useSession.setState({ user: undefined })
  })

  it('leads with status and the official score with its provenance', async () => {
    mockApi({
      'GET /projects/aave': [200, aave],
      'GET /projects/p1/score': [200, score],
      'GET /projects/p1/comments': [200, []],
    })
    renderDetail('aave')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Aave' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Report published').length).toBeGreaterThan(0)

    const scoreRegion = await screen.findByRole('region', {
      name: 'Official safety score',
    })
    expect(await within(scoreRegion).findByText('82.0')).toBeInTheDocument()
    expect(within(scoreRegion).getByText(/Higher is safer/)).toBeInTheDocument()
    expect(
      within(scoreRegion).getByText('Published by the governor council · Round 3'),
    ).toBeInTheDocument()
    expect(within(scoreRegion).queryByText(/review factors/)).not.toBeInTheDocument()
  })

  it('orders the report: score, findings, market context, then discussion', async () => {
    mockApi({
      'GET /projects/aave': [200, aave],
      'GET /projects/p1/score': [200, score],
      'GET /projects/p1/comments': [200, []],
    })
    renderDetail('aave')

    const names = [
      'Official safety score',
      'Council findings',
      'Market context',
      'Discussion',
    ]
    await screen.findByRole('region', { name: names[0] })
    const regions = names.map((name) => screen.getByRole('region', { name }))
    for (let index = 1; index < regions.length; index += 1) {
      expect(regions[index - 1]!.compareDocumentPosition(regions[index]!)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      )
    }
    expect(
      within(screen.getByRole('region', { name: 'Market context' })).getByText(
        /not part of the safety score/i,
      ),
    ).toBeInTheDocument()
  })

  it('separates reference data from the council report instead of mixing verdicts', async () => {
    mockApi({
      'GET /projects/aave': [200, aave],
      'GET /projects/p1/score': [200, score],
      'GET /projects/p1/comments': [200, []],
    })
    renderDetail('aave')

    const findings = await screen.findByRole('region', { name: 'Council findings' })
    expect(
      within(findings).getByRole('link', { name: 'View the reference assessment' }),
    ).toHaveAttribute('href', '/app/reference/aave')
    expect(screen.queryByText('Council verdict')).not.toBeInTheDocument()
    expect(screen.queryByText('Analyst notes')).not.toBeInTheDocument()
    expect(screen.queryByText('92%')).not.toBeInTheDocument()
  })

  it('never shows simulated governor vote controls', async () => {
    useSession.setState({
      user: { id: 'admin', email: 'gov@example.com', nickname: 'gov', role: 'admin' },
    })
    mockApi({
      'GET /projects/aave': [200, { ...aave, state: 'voting' }],
      'GET /projects/p1/comments': [200, []],
    })
    renderDetail('aave')

    await screen.findByRole('heading', { level: 1, name: 'Aave' })
    expect(
      screen.queryByRole('button', { name: /Mark (safe|unsafe)/ }),
    ).not.toBeInTheDocument()
  })

  it('explains the lifecycle when no official score exists yet', async () => {
    mockApi({
      'GET /projects/nova-dex': [200, nova],
      'GET /projects/p2/score': [404, { message: 'Not found' }],
      'GET /projects/p2/comments': [200, []],
    })
    renderDetail('nova-dex')

    const scoreRegion = await screen.findByRole('region', {
      name: 'Official safety score',
    })
    expect(
      await within(scoreRegion).findByText('No official score yet'),
    ).toBeInTheDocument()

    const lifecycle = screen.getByRole('list', { name: 'Review lifecycle' })
    expect(within(lifecycle).getByText('In analysis').closest('li')).toHaveAttribute(
      'aria-current',
      'step',
    )
    expect(screen.getByText('Not anchored on-chain yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Request a review' })).toHaveAttribute(
      'href',
      '/app/analysis-request',
    )
    expect(screen.queryByText(/Submit evidence/)).not.toBeInTheDocument()
  })

  it('shows a not-found state after a single request for unknown projects', async () => {
    const fetchMock = mockApi({})
    renderDetail('missing')

    expect(
      await screen.findByRole('heading', { name: 'Project not found' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to projects' })).toHaveAttribute(
      'href',
      '/app',
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
