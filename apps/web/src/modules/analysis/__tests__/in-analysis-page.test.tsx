import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { InAnalysisPage } from '../pages/in-analysis-page'
import { mockApi } from '../../../test/mock-api'
import { renderRoutes } from '../../../test/render-routes'
import { useSession } from '../../../store/session'

const request = (overrides: Record<string, unknown>) => ({
  id: 'r1',
  userId: 'u1',
  projectName: 'Orbit Bridge',
  projectUrl: 'https://orbit.example',
  description: 'Cross-chain bridge with a new validator set.',
  status: 'pending',
  paymentTxHash: null,
  feeAmount: '0',
  reviewNotes: null,
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: null,
  ...overrides,
})

const requests = [
  request({}),
  request({ id: 'r2', projectName: 'Lumen Swap', status: 'in_review' }),
  request({
    id: 'r3',
    projectName: 'Nimbus Vault',
    status: 'approved',
    reviewNotes: 'In scope; added to the catalog.',
  }),
  request({ id: 'r4', projectName: 'Shady Yield', status: 'rejected' }),
]

const inAnalysisProject = {
  id: 'p2',
  slug: 'newdex',
  name: 'NewDex',
  description: 'Emerging exchange',
  chainId: 1,
  state: 'in_analysis',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const renderQueue = () =>
  renderRoutes(
    [{ path: '/app/in-analysis', element: <InAnalysisPage /> }],
    '/app/in-analysis',
  )

const cardFor = (name: string) => screen.getByRole('article', { name })

describe('InAnalysisPage', () => {
  afterEach(() => {
    cleanup()
    useSession.setState({ user: undefined })
  })

  it('explains that a request is not a published review', async () => {
    mockApi({
      'GET /analysis-requests': [200, { items: [] }],
      'GET /projects': [200, []],
    })
    renderQueue()

    expect(
      screen.getByRole('heading', { level: 1, name: 'In analysis' }),
    ).toBeInTheDocument()
    const legend = screen.getByRole('region', { name: 'What request statuses mean' })
    for (const label of ['Received', 'Under review', 'Accepted', 'Declined']) {
      expect(within(legend).getByText(label)).toBeInTheDocument()
    }
    expect(screen.getByText(/A request is not a review/)).toBeInTheDocument()
  })

  it('labels each request with a readable status and next step', async () => {
    mockApi({
      'GET /analysis-requests': [200, { items: requests }],
      'GET /projects': [200, []],
    })
    renderQueue()

    const pending = await screen.findByRole('article', { name: 'Orbit Bridge' })
    expect(within(pending).getByText('Received')).toBeInTheDocument()
    expect(
      within(pending).getByText(/Waiting for the council to triage it/),
    ).toBeInTheDocument()
    expect(within(cardFor('Lumen Swap')).getByText('Under review')).toBeInTheDocument()
    expect(within(cardFor('Shady Yield')).getByText('Declined')).toBeInTheDocument()

    const accepted = cardFor('Nimbus Vault')
    expect(within(accepted).getByText('Accepted')).toBeInTheDocument()
    expect(within(accepted).getByText('Council notes')).toBeInTheDocument()
    expect(
      within(accepted).getByText('In scope; added to the catalog.'),
    ).toBeInTheDocument()

    expect(screen.queryByText(/in_review|in review/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('lets team members triage requests without fabricated verdict notes', async () => {
    useSession.setState({ user: { id: 't1', role: 'team', email: 'team@example.com' } })
    const patches: unknown[] = []
    mockApi({
      'GET /analysis-requests': [200, { items: requests }],
      'GET /projects': [200, []],
      'PATCH /analysis-requests/r1': (body) => {
        patches.push(body)
        return [200, request({ status: 'in_review' })]
      },
      'PATCH /analysis-requests/r2': (body) => {
        patches.push(body)
        return [200, request({ id: 'r2', status: 'approved' })]
      },
    })
    const user = userEvent.setup()
    renderQueue()

    const pending = await screen.findByRole('article', { name: 'Orbit Bridge' })
    expect(within(pending).getByRole('button', { name: 'Decline' })).toBeInTheDocument()
    await user.click(within(pending).getByRole('button', { name: 'Start review' }))
    await user.click(
      within(cardFor('Lumen Swap')).getByRole('button', { name: 'Accept' }),
    )

    await waitFor(() =>
      expect(patches).toEqual([{ status: 'in_review' }, { status: 'approved' }]),
    )
    expect(within(cardFor('Nimbus Vault')).queryByRole('button')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Mark (safe|unsafe)/ }),
    ).not.toBeInTheDocument()
  })

  it('reports a failed triage action', async () => {
    useSession.setState({ user: { id: 't1', role: 'admin' } })
    mockApi({
      'GET /analysis-requests': [200, { items: [request({})] }],
      'GET /projects': [200, []],
      'PATCH /analysis-requests/r1': [500, { message: 'boom' }],
    })
    const user = userEvent.setup()
    renderQueue()

    const card = await screen.findByRole('article', { name: 'Orbit Bridge' })
    await user.click(within(card).getByRole('button', { name: 'Decline' }))
    expect(await within(card).findByRole('alert')).toHaveTextContent(
      "The status couldn't be updated.",
    )
  })

  it('shows a retry when requests fail to load', async () => {
    const fetchMock = mockApi({
      'GET /analysis-requests': [500, { message: 'down' }],
      'GET /projects': [200, []],
    })
    const user = userEvent.setup()
    renderQueue()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Review requests couldn't be loaded.",
    )
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.filter(([url]) =>
          String(url).includes('/analysis-requests'),
        ),
      ).toHaveLength(2),
    )
  })

  it('invites a request when the queue is empty and lists council projects in analysis', async () => {
    mockApi({
      'GET /analysis-requests': [200, { items: [] }],
      'GET /projects': [200, [inAnalysisProject]],
    })
    renderQueue()

    expect(await screen.findByText('No review requests yet.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Request a review' })).toHaveAttribute(
      'href',
      '/app/analysis-request',
    )
    const council = screen.getByRole('region', { name: 'Council projects in analysis' })
    expect(await within(council).findByRole('link', { name: /NewDex/ })).toHaveAttribute(
      'href',
      '/app/projects/newdex',
    )
  })
})
