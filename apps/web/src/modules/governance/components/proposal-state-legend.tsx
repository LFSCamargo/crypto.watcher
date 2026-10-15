import { PROPOSAL_STATE_ORDER, proposalStateMeta } from '../lib/proposal-state'
import { ProposalStateBadge } from './proposal-state-badge'

export function ProposalStateLegend() {
  return (
    <details className="glass-card-flat rounded-3xl p-5 text-sm">
      <summary className="cursor-pointer font-semibold">
        What proposal states mean
      </summary>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {PROPOSAL_STATE_ORDER.map((state) => (
          <div key={state} className="space-y-1">
            <dt>
              <ProposalStateBadge state={state} />
            </dt>
            <dd className="text-muted-foreground">
              {proposalStateMeta(state).description}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  )
}
