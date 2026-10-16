import { Link } from 'react-router-dom'
import { formatUnits, type Address } from 'viem'
import { Button, FormAlert } from '../../../components/ui'
import { governanceChain } from '../../../lib/web3/governor'
import { Web3Providers } from '../../../lib/web3/web3-providers'
import { useProposalVote, type VoteSupport } from '../hooks/use-proposal-vote'
import { TransactionLink } from './transaction-link'

const CHOICES: { label: string; support: VoteSupport }[] = [
  { label: 'For', support: 1 },
  { label: 'Against', support: 0 },
  { label: 'Abstain', support: 2 },
]

const votesFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 2 })

interface ProposalVoteControlsProps {
  governor: Address
  proposalId: bigint
}

function Controls({ governor, proposalId }: ProposalVoteControlsProps) {
  const vote = useProposalVote({ governor, proposalId })
  const { status } = vote

  if (status === 'disconnected') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Connect the wallet that holds your delegated CWT voting power.
        </p>
        <Button className="rounded-full" onClick={vote.connect}>
          Connect wallet
        </Button>
      </div>
    )
  }

  if (status === 'wrong-network') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Protocol votes happen on {governanceChain.name}. Your wallet is on another
          network.
        </p>
        <Button
          className="rounded-full"
          onClick={vote.switchNetwork}
          disabled={vote.isSwitching}
        >
          Switch to {governanceChain.name}
        </Button>
      </div>
    )
  }

  if (status === 'checking') {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Checking your voting power…
      </p>
    )
  }

  if (status === 'read-failed') {
    return (
      <div className="space-y-3">
        <FormAlert>We couldn&apos;t read your voting power from the network.</FormAlert>
        <Button variant="outline" className="rounded-full" onClick={vote.retryReads}>
          Try again
        </Button>
      </div>
    )
  }

  if (status === 'ineligible') {
    return (
      <p className="text-sm text-muted-foreground">
        This wallet had no delegated CWT voting power when voting opened, so it can&apos;t
        vote on this proposal.{' '}
        <Link
          to="/docs/governance#vote-delegation"
          className="font-semibold text-foreground underline underline-offset-2"
        >
          How delegation works
        </Link>
      </p>
    )
  }

  if (status === 'voted') {
    return (
      <p className="text-sm font-medium">
        This wallet has already voted on this proposal.
      </p>
    )
  }

  if (status === 'confirmed') {
    return (
      <FormAlert tone="success">
        <p className="font-semibold">Your vote was recorded on-chain.</p>
        {vote.txHash ? <TransactionLink hash={vote.txHash} /> : null}
      </FormAlert>
    )
  }

  if (status === 'pending') {
    return (
      <div role="status" className="space-y-1 text-sm">
        <p className="font-semibold">
          Vote sent — waiting for the network to confirm it.
        </p>
        {vote.txHash ? <TransactionLink hash={vote.txHash} /> : null}
      </div>
    )
  }

  const locked = status === 'awaiting-signature'

  return (
    <div className="space-y-4">
      {vote.votingPower !== undefined ? (
        <p className="text-sm text-muted-foreground">
          Your voting power:{' '}
          <span className="font-semibold text-foreground">
            {votesFormat.format(Number(formatUnits(vote.votingPower, 18)))} CWT
          </span>
        </p>
      ) : null}

      {status === 'rejected' ? (
        <div role="status" className="space-y-2 text-sm">
          <p>You cancelled the request in your wallet. No vote was sent.</p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={vote.reset}
          >
            Try again
          </Button>
        </div>
      ) : null}

      {status === 'failed' ? (
        <div className="space-y-2">
          <FormAlert>
            <p className="font-semibold">The vote didn&apos;t go through.</p>
            <p>{vote.failure}</p>
          </FormAlert>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={vote.reset}
          >
            Try again
          </Button>
        </div>
      ) : null}

      {status === 'ready' || locked ? (
        <div role="group" aria-label="Cast your vote" className="flex flex-wrap gap-2">
          {CHOICES.map((choice) => (
            <Button
              key={choice.label}
              variant={choice.support === 1 ? 'default' : 'outline'}
              className="min-w-24 rounded-full"
              disabled={locked}
              onClick={() => vote.castVote(choice.support)}
            >
              {choice.label}
            </Button>
          ))}
        </div>
      ) : null}

      {locked ? (
        <p role="status" className="text-sm font-medium">
          Confirm the vote in your wallet.
        </p>
      ) : null}
    </div>
  )
}

export default function ProposalVoteControls(props: ProposalVoteControlsProps) {
  return (
    <Web3Providers>
      <Controls {...props} />
    </Web3Providers>
  )
}
