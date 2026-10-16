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
    expect(
      screen.getByRole('button', { name: 'What proposal states mean' }),
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('states plainly that CWT is not minted and no mint date is set', async () => {
    mockApi({ 'GET /governance/proposals': [200, []] })
    renderGovernance()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Governance' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Pre-launch · CWT not minted')).toBeInTheDocument()
    const stats = screen.getByRole('list', { name: 'Governance at a glance' })
    expect(within(stats).getByText('Not scheduled')).toBeInTheDocument()

    const tracker = screen.getByRole('list', { name: 'Governance milestones' })
    const steps = within(tracker).getAllByRole('listitem')
    expect(steps[0]).toHaveTextContent('Built')
    expect(
      steps.find((step) => step.getAttribute('aria-current') === 'step'),
    ).toHaveTextContent(/Deploy the governance contracts/)
    expect(within(tracker).getByText(/CWT minted and distributed/)).toBeInTheDocument()
  })

  it('explains who decides today and answers token questions in expandables', async () => {
    mockApi({ 'GET /governance/proposals': [200, []] })
    const user = userEvent.setup()
    renderGovernance()

    expect(screen.getByRole('region', { name: 'Who decides today' })).toBeInTheDocument()
    const question = screen.getByRole('button', { name: 'Can I buy CWT today?' })
    await user.click(question)
    expect(question).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByRole('region', { name: 'Can I buy CWT today?' }),
    ).toHaveTextContent(/not been minted/)
  })

  it('shows an honest empty state', async () => {
    mockApi({ 'GET /governance/proposals': [200, []] })
    renderGovernance()

    expect(await screen.findByText('No proposals yet.')).toBeInTheDocument()
    expect(
      screen.getByText(/open once CWT is minted and the Governor contract is deployed/),
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
