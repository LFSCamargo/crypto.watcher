import { Badge } from '../../../components/ui'
import { proposalStateMeta } from '../lib/proposal-state'

export function ProposalStateBadge({ state }: { state: string }) {
  const meta = proposalStateMeta(state)
  return <Badge variant={meta.tone}>{meta.label}</Badge>
}
