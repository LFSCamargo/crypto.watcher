import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockApi } from '../../../test/mock-api'
import { renderRoutes } from '../../../test/render-routes'
import { GovernanceDetailPage } from '../pages/governance-detail-page'

const wallet = vi.hoisted(() => ({
  governor: '0x00000000000000000000000000000000000000a1' as string | undefined,
  account: {} as { address?: string; isConnected: boolean; chainId?: number },
  reads: {} as Record<string, { data?: unknown; isError?: boolean }>,
  write: {} as {
    data?: string
    error?: Error | null
    isPending: boolean
  },
  receipt: {} as { isSuccess?: boolean; isError?: boolean; data?: { status: string } },
  writeContract: vi.fn(),
  reset: vi.fn(),
  switchChain: vi.fn(),
  openConnectModal: vi.fn(),
}))

vi.mock('../../../lib/web3/web3-providers', () => ({
  Web3Providers: ({ children }: { children: ReactNode }) => children,
}))

vi.mock('../../../lib/web3/governor', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../lib/web3/governor')>()
  return {
    ...actual,
    get governorAddress() {
      return wallet.governor
    },
  }
})

vi.mock('@rainbow-me/rainbowkit', () => ({
  useConnectModal: () => ({ openConnectModal: wallet.openConnectModal }),
}))

vi.mock('wagmi', () => ({
  useAccount: () => wallet.account,
  useSwitchChain: () => ({ switchChain: wallet.switchChain, isPending: false }),
  useReadContract: ({ functionName }: { functionName: string }) => ({
    data: undefined,
    isError: false,
    refetch: vi.fn(),
    ...wallet.reads[functionName],
  }),
  useWriteContract: () => ({
    ...wallet.write,
    writeContract: wallet.writeContract,
    reset: wallet.reset,
  }),
  useWaitForTransactionReceipt: () => ({ error: null, ...wallet.receipt }),
}))

const BASE_SEPOLIA = 84532
const voter = '0x1234567890abcdef1234567890abcdef12345678'

const proposal = (state: string) => ({
  id: 'p1',
  onchainId: '77',
  proposerAddress: '0xabc0000000000000000000000000000000000001',
  title: 'Add a tokenomics specialist to the council',
  description: 'Expand the council with a tokenomics reviewer.',
  state,
  startBlock: '100',
  endBlock: '200',
})

const renderDetail = (state = 'active') => {
  mockApi({ 'GET /governance/proposals/77': [200, proposal(state)] })
  return renderRoutes(
    [{ path: '/app/governance/:onchainId', element: <GovernanceDetailPage /> }],
    '/app/governance/77',
  )
}

const votePanel = async () => {
  const panel = await screen.findByRole('region', { name: 'Your vote' })
  await waitFor(() =>
    expect(within(panel).queryByText('Loading wallet tools…')).toBeNull(),
  )
  return panel
}

describe('GovernanceDetailPage', () => {
  beforeEach(() => {
    wallet.governor = '0x00000000000000000000000000000000000000a1'
    wallet.account = { address: voter, isConnected: true, chainId: BASE_SEPOLIA }
    wallet.reads = {
      proposalSnapshot: { data: 90n },
      getVotes: { data: 5_000n * 10n ** 18n },
      hasVoted: { data: false },
    }
    wallet.write = { isPending: false, error: null }
    wallet.receipt = {}
    vi.clearAllMocks()
  })
  afterEach(cleanup)

  it('shows a not-found state with a way back', async () => {
    mockApi({ 'GET /governance/proposals/77': [404, { message: 'Not found' }] })
    renderRoutes(
      [{ path: '/app/governance/:onchainId', element: <GovernanceDetailPage /> }],
      '/app/governance/77',
    )

    expect(
      await screen.findByRole('heading', { name: 'Proposal not found' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to governance' })).toHaveAttribute(
      'href',
      '/app/governance',
    )
  })

  it('renders the proposal, its lifecycle and that voting has ended', async () => {
    renderDetail('succeeded')

    expect(
      await screen.findByRole('heading', { level: 1, name: /tokenomics specialist/ }),
    ).toBeInTheDocument()
    const lifecycle = screen.getByRole('list', { name: 'Proposal lifecycle' })
    expect(within(lifecycle).getByText('Passed').closest('li')).toHaveAttribute(
      'aria-current',
      'step',
    )
    const panel = await votePanel()
    expect(within(panel).getByText(/Voting has ended/)).toBeInTheDocument()
    expect(within(panel).queryByRole('button', { name: 'For' })).not.toBeInTheDocument()
  })

  it('explains when in-app voting is not configured', async () => {
    wallet.governor = undefined
    renderDetail()

    const panel = await votePanel()
    expect(within(panel).getByText(/In-app voting isn't enabled/)).toBeInTheDocument()
  })

  it('asks disconnected visitors to connect a wallet', async () => {
    const user = userEvent.setup()
    wallet.account = { isConnected: false }
    renderDetail()

    await user.click(
      within(await votePanel()).getByRole('button', { name: 'Connect wallet' }),
    )
    expect(wallet.openConnectModal).toHaveBeenCalled()
  })

  it('offers a network switch on the wrong chain', async () => {
    const user = userEvent.setup()
    wallet.account = { address: voter, isConnected: true, chainId: 1 }
    renderDetail()

    await user.click(
      within(await votePanel()).getByRole('button', { name: 'Switch to Base Sepolia' }),
    )
    expect(wallet.switchChain).toHaveBeenCalledWith({ chainId: BASE_SEPOLIA })
  })

  it('explains why a wallet without voting power cannot vote', async () => {
    wallet.reads.getVotes = { data: 0n }
    renderDetail()

    const panel = await votePanel()
    expect(within(panel).getByText(/no delegated CWT voting power/)).toBeInTheDocument()
    expect(within(panel).queryByRole('button', { name: 'For' })).not.toBeInTheDocument()
  })

  it('says when this wallet already voted', async () => {
    wallet.reads.hasVoted = { data: true }
    renderDetail()

    expect(within(await votePanel()).getByText(/already voted/)).toBeInTheDocument()
  })

  it('casts a vote with the chosen support value', async () => {
    const user = userEvent.setup()
    renderDetail()

    const panel = await votePanel()
    expect(within(panel).getByText(/5,000 CWT/)).toBeInTheDocument()
    await user.click(within(panel).getByRole('button', { name: 'Against' }))

    expect(wallet.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'castVote', args: [77n, 0] }),
    )
  })

  it('locks the choices while the wallet asks for confirmation', async () => {
    wallet.write = { isPending: true, error: null }
    renderDetail()

    const panel = await votePanel()
    expect(
      within(panel).getByText('Confirm the vote in your wallet.'),
    ).toBeInTheDocument()
    expect(within(panel).getByRole('button', { name: 'For' })).toBeDisabled()
  })

  it('reports a pending and then a confirmed transaction', async () => {
    wallet.write = { isPending: false, error: null, data: '0xfeed' }
    const { unmount } = renderDetail()

    expect(
      within(await votePanel()).getByText(/waiting for the network to confirm/),
    ).toBeInTheDocument()
    unmount()

    wallet.receipt = { isSuccess: true, data: { status: 'success' } }
    renderDetail()
    const panel = await votePanel()
    expect(
      within(panel).getByText('Your vote was recorded on-chain.'),
    ).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: /View transaction/ })).toHaveAttribute(
      'href',
      expect.stringContaining('/tx/0xfeed'),
    )
  })

  it('treats a declined wallet request as cancelled and allows a retry', async () => {
    const user = userEvent.setup()
    const rejected = Object.assign(new Error('User rejected the request.'), {
      code: 4001,
    })
    wallet.write = { isPending: false, error: rejected }
    renderDetail()

    const panel = await votePanel()
    expect(within(panel).getByText(/You cancelled the request/)).toBeInTheDocument()
    await user.click(within(panel).getByRole('button', { name: 'Try again' }))
    expect(wallet.reset).toHaveBeenCalled()
  })

  it('surfaces a failed transaction as an alert', async () => {
    wallet.write = {
      isPending: false,
      error: Object.assign(new Error('execution reverted'), {
        shortMessage: 'Governor: vote not currently active',
      }),
    }
    renderDetail()

    const alert = within(await votePanel()).getByRole('alert')
    expect(alert).toHaveTextContent("The vote didn't go through.")
    expect(alert).toHaveTextContent('Governor: vote not currently active')
  })
})
