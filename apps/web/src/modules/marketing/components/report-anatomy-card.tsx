import { RiErrorWarningLine } from '@remixicon/react'
import { cn } from '../../../lib/utils'
import { SpotlightCard } from './spotlight-card'

const factors = [
  { label: 'Smart contract security', value: 88, bar: 'bg-tone-sky' },
  { label: 'Protocol design', value: 79, bar: 'bg-tone-violet' },
  { label: 'Tokenomics', value: 71, bar: 'bg-tone-amber' },
  { label: 'Governance', value: 84, bar: 'bg-tone-teal' },
]

export function ReportAnatomyCard({ className }: { className?: string }) {
  return (
    <SpotlightCard
      tone="teal"
      aria-labelledby="report-card-title"
      className={cn('space-y-5', className)}
    >
      <div className="space-y-2">
        <h3 id="report-card-title" className="text-xl font-bold">
          Every score shows its working
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Findings and risk factors are organised by area, so you see why a project scored
          the way it did.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-background/70 p-4">
        <p className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold uppercase tracking-wider">
            Illustrative report
          </span>
          <span>Factor scores</span>
        </p>
        <ul className="space-y-3">
          {factors.map((factor, index) => (
            <li key={factor.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{factor.label}</span>
                <span className="font-semibold tabular-nums">{factor.value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <span
                  className={cn(
                    'block h-full origin-left animate-bar-fill rounded-full',
                    factor.bar,
                  )}
                  aria-hidden
                  style={{ width: `${factor.value}%`, animationDelay: `${index * 80}ms` }}
                />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex gap-2 rounded-xl bg-tone-amber/10 p-3 text-xs">
          <RiErrorWarningLine
            aria-hidden
            className="mt-0.5 h-4 w-4 shrink-0 text-tone-amber-strong"
          />
          <span>
            <span className="font-semibold">Finding:</span> an admin key can upgrade the
            contracts, mitigated by a 48-hour timelock.
          </span>
        </p>
      </div>
    </SpotlightCard>
  )
}
