import type { GovernanceProposal } from '../../../lib/api/types'

type ProposalState = GovernanceProposal['state']
type Tone = 'info' | 'success' | 'secondary' | 'danger' | 'default'

interface ProposalStateMeta {
  label: string
  tone: Tone
  description: string
}

const META: Record<ProposalState, ProposalStateMeta> = {
  pending: {
    label: 'Not open yet',
    tone: 'info',
    description:
      'Voting opens after the voting delay. Voting power is fixed at that moment.',
  },
  active: {
    label: 'Voting open',
    tone: 'success',
    description:
      'CWT holders with delegated voting power can vote For, Against or Abstain.',
  },
  succeeded: {
    label: 'Passed',
    tone: 'default',
    description:
      'Quorum was met and more votes were For. It can be queued in the timelock.',
  },
  defeated: {
    label: 'Not passed',
    tone: 'danger',
    description: 'Quorum was not met or more votes were Against.',
  },
  executed: {
    label: 'Executed',
    tone: 'secondary',
    description: 'The timelock delay passed and the change was applied on-chain.',
  },
}

const FALLBACK: ProposalStateMeta = {
  label: 'Unknown state',
  tone: 'secondary',
  description: 'The indexer reported a state the app does not recognize yet.',
}

export function proposalStateMeta(state: string): ProposalStateMeta {
  return META[state as ProposalState] ?? FALLBACK
}

export const PROPOSAL_STATE_ORDER: ProposalState[] = [
  'pending',
  'active',
  'succeeded',
  'defeated',
  'executed',
]
