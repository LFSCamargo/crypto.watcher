import { RiCheckLine } from '@remixicon/react'
import type { ProjectState } from '../../../lib/api/types'
import { cn } from '../../../lib/utils'
import { PROJECT_LIFECYCLE_STEPS, projectStateMeta } from '../lib/format'

export function ProjectLifecycleSteps({ state }: { state: ProjectState }) {
  const { step: currentStep, description } = projectStateMeta(state)
  const isFinal = currentStep === PROJECT_LIFECYCLE_STEPS.length - 1

  return (
    <div className="space-y-4">
      <ol aria-label="Review lifecycle" className="space-y-3">
        {PROJECT_LIFECYCLE_STEPS.map((label, index) => {
          const done = index < currentStep || (isFinal && index === currentStep)
          const current = index === currentStep
          return (
            <li
              key={label}
              aria-current={current ? 'step' : undefined}
              className="flex items-center gap-3 text-sm"
            >
              <span
                aria-hidden
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                  done && 'border-success/40 bg-success/15 text-success-strong',
                  current && !done && 'border-primary bg-primary/15 text-primary-strong',
                  !done && !current && 'border-border text-muted-foreground',
                )}
              >
                {done ? <RiCheckLine className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  current ? 'font-semibold text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
              {done && !current ? <span className="sr-only">(complete)</span> : null}
            </li>
          )
        })}
      </ol>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}
