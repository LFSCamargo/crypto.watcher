import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { mockApi } from '../../../test/mock-api'
import { renderRoutes } from '../../../test/render-routes'
import { GovernancePage } from '../pages/governance-page'

const proposals = [
  {
    id: 'p1',
    onchainId: '1234567890123456789',
    proposerAddress: '0xabc',
    title: 'Add a tokenomics specialist to the council',
    description: null,
    state: 'active',
    startBlock: '10',
    endBlock: '20',
  },
  {
    id: 'p2',
    onchainId: '42',
    proposerAddress: '0xdef',
    title: 'Adopt methodology v2',
    description: null,
    state: 'defeated',
    startBlock: '1',
    endBlock: '5',
  },
]

const renderGovernance = () =>
  renderRoutes(
    [{ path: '/app/governance', element: <GovernancePage /> }],
    '/app/governance',
  )

describe('GovernancePage', () => {
  afterEach(cleanup)

  it('lists proposals with readable states and links to each one', async () => {
    mockApi({ 'GET /governance/proposals': [200, proposals] })
    renderGovernance()

    const open = await screen.findByRole('article', { name: /tokenomics specialist/ })
    expect(within(open).getByText('Voting open')).toBeInTheDocument()
    expect(within(open).getByRole('link')).toHaveAttribute(
      'href',
      '/app/governance/1234567890123456789',
    )
    const closed = screen.getByRole('article', { name: /methodology v2/ })
    expect(within(closed).getByText('Not passed')).toBeInTheDocument()
  })

  it('separates protocol governance from project scores and explains states', async () => {
    mockApi({ 'GET /governance/proposals': [200, proposals] })
    renderGovernance()

    expect(
      await screen.findByText(/Project scores are published by the governor council/),
    ).toBeInTheDocument()
    expect(screen.getByText('What proposal states mean')).toBeInTheDocument()
  })

  it('shows an honest empty state', async () => {
    mockApi({ 'GET /governance/proposals': [200, []] })
    renderGovernance()

    expect(
      await screen.findByText('No proposals have been indexed yet.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Be the first/)).not.toBeInTheDocument()
  })

  it('retries after a failed load without reloading the page', async () => {
    const user = userEvent.setup()
    let calls = 0
    mockApi({
      'GET /governance/proposals': () => {
        calls += 1
        return calls === 1 ? [500, { message: 'boom' }] : [200, proposals]
      },
    })
    renderGovernance()

    await user.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Adopt methodology v2')).toBeInTheDocument()
  })
})
