import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import type { GovernanceProposal } from '../../../lib/api/types'
import { governorAddress } from '../../../lib/web3/governor'
import { proposalStateMeta } from '../lib/proposal-state'
import { parseProposalId } from '../lib/proposal-id'

const ProposalVoteControls = lazy(() => import('./proposal-vote-controls'))

function closedMessage(state: GovernanceProposal['state']) {
  if (state === 'pending') {
    return "Voting hasn't opened yet. Voting power is fixed when it opens, so delegate before then."
  }
  return `Voting has ended. Outcome: ${proposalStateMeta(state).label}.`
}

export function ProposalVoteSection({ proposal }: { proposal: GovernanceProposal }) {
  const proposalId = parseProposalId(proposal.onchainId)
  const governor = governorAddress

  return (
    <section
      aria-labelledby="your-vote-title"
      className="glass-card space-y-4 rounded-3xl p-6"
    >
      <h2 id="your-vote-title" className="text-lg font-semibold">
        Your vote
      </h2>
      {proposal.state !== 'active' ? (
        <p className="text-sm text-muted-foreground">{closedMessage(proposal.state)}</p>
      ) : !governor || proposalId === undefined ? (
        <p className="text-sm text-muted-foreground">
          In-app voting isn&apos;t enabled on this deployment. Vote with your wallet
          directly on the Governor contract.{' '}
          <Link
            to="/docs/governance#proposal-process"
            className="font-semibold text-foreground underline underline-offset-2"
          >
            How voting works
          </Link>
        </p>
      ) : (
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">Loading wallet tools…</p>
          }
        >
          <ProposalVoteControls governor={governor} proposalId={proposalId} />
        </Suspense>
      )}
      <p className="text-xs text-muted-foreground">
        CWT votes decide protocol policy only. They never change a project&apos;s risk
        score.
      </p>
    </section>
  )
}
