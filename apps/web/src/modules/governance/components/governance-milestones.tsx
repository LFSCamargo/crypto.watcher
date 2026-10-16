import { RiCheckLine } from '@remixicon/react'
import { cn } from '../../../lib/utils'
import { governanceMilestones } from '../lib/governance-milestones'

const labelClasses = {
  done: 'bg-tone-teal/15 text-tone-teal-strong',
  next: 'bg-tone-amber/15 text-tone-amber-strong',
  later: 'bg-muted text-muted-foreground',
}

export function GovernanceMilestones() {
  const doneCount = governanceMilestones.filter((m) => m.status === 'done').length
  const progress = (doneCount / governanceMilestones.length) * 100

  return (
    <section aria-labelledby="governance-status-title" className="space-y-5">
      <div className="space-y-1">
        <h2 id="governance-status-title" className="text-xl font-semibold">
          Where governance stands
        </h2>
        <p className="text-sm text-muted-foreground">
          The groundwork is built. Deployment and the CWT mint haven&apos;t been planned
          yet, so on-chain voting isn&apos;t open.
        </p>
      </div>

      <div className="glass-card-flat relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div
          aria-hidden
          className="absolute bottom-8 left-[2.4rem] top-8 w-px bg-border md:left-[2.9rem]"
        >
          <span
            className="block w-full origin-top animate-bar-fill-y bg-gradient-to-b from-tone-teal to-tone-amber"
            style={{ height: `${progress}%` }}
          />
        </div>
        <ol aria-label="Governance milestones" className="relative space-y-6">
          {governanceMilestones.map((milestone, index) => (
            <li
              key={milestone.title}
              aria-current={milestone.status === 'next' ? 'step' : undefined}
              className="flex gap-4"
            >
              <span
                aria-hidden
                className={cn(
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-4 ring-background',
                  milestone.status === 'done' && 'bg-tone-teal text-white',
                  milestone.status === 'next' &&
                    'bg-tone-amber text-foreground after:absolute after:inset-0 after:animate-ping after:rounded-full after:bg-tone-amber/40 motion-reduce:after:animate-none',
                  milestone.status === 'later' &&
                    'border border-dashed border-border bg-background text-muted-foreground',
                )}
              >
                {milestone.status === 'done' ? (
                  <RiCheckLine className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </span>
              <div className="min-w-0 flex-1 space-y-1 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{milestone.title}</h3>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      labelClasses[milestone.status],
                    )}
                  >
                    {milestone.label}
                  </span>
                  {milestone.status === 'next' && (
                    <span className="text-xs font-medium text-tone-amber-strong">
                      Up next
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{milestone.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
