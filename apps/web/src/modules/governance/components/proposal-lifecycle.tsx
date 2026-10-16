import { cn } from '../../../lib/utils'
import type { GovernanceProposal } from '../../../lib/api/types'

const STEPS = ['Proposed', 'Voting', 'Outcome', 'Executed'] as const

const STEP_BY_STATE: Record<GovernanceProposal['state'], number> = {
  pending: 0,
  active: 1,
  succeeded: 2,
  defeated: 2,
  executed: 3,
}

export function ProposalLifecycle({ state }: { state: GovernanceProposal['state'] }) {
  const current = STEP_BY_STATE[state] ?? 0
  const outcome =
    state === 'defeated' ? 'Not passed' : state === 'succeeded' ? 'Passed' : 'Outcome'

  return (
    <ol aria-label="Proposal lifecycle" className="grid grid-cols-4 gap-2 text-xs">
      {STEPS.map((step, index) => {
        const label = step === 'Outcome' ? outcome : step
        const reached = index <= current && !(state === 'defeated' && index === 3)
        return (
          <li
            key={step}
            aria-current={index === current ? 'step' : undefined}
            className="space-y-2"
          >
            <span
              aria-hidden
              className={cn(
                'block h-1.5 rounded-full',
                reached ? 'bg-primary' : 'bg-border',
              )}
            />
            <span
              className={cn(
                index === current ? 'font-semibold' : 'text-muted-foreground',
              )}
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
