import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import type { GovernanceProposal } from '../../../lib/api/types'
import { ProposalStateBadge } from './proposal-state-badge'

const shortId = (id: string) =>
  id.length > 12 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id

export function ProposalCard({ proposal }: { proposal: GovernanceProposal }) {
  return (
    <article
      aria-labelledby={`proposal-${proposal.id}-title`}
      className="glass-card-flat group relative flex items-center gap-4 rounded-3xl p-5 transition-colors hover:border-foreground/20"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <h3 id={`proposal-${proposal.id}-title`} className="font-semibold">
          <Link
            to={`/app/governance/${proposal.onchainId}`}
            className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none"
          >
            {proposal.title}
          </Link>
        </h3>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <ProposalStateBadge state={proposal.state} />
          <span>Proposal {shortId(proposal.onchainId)}</span>
        </div>
      </div>
      <ArrowRight
        size={20}
        aria-hidden
        className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"
      />
    </article>
  )
}
