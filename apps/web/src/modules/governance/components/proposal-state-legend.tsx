import { Disclosure } from '../../../components/ui'
import { PROPOSAL_STATE_ORDER, proposalStateMeta } from '../lib/proposal-state'
import { ProposalStateBadge } from './proposal-state-badge'

export function ProposalStateLegend() {
  return (
    <Disclosure
      title="What proposal states mean"
      className="glass-card-flat rounded-3xl p-5 text-sm"
    >
      <dl className="grid gap-3 pt-1 sm:grid-cols-2">
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
    </Disclosure>
  )
}
