import { cn } from '../../../lib/utils'
import { SpotlightCard } from './spotlight-card'

const areas = [
  {
    label: 'Smart contract security',
    detail: 'Upgrade keys, admin powers, and audits — and whether a bug can drain funds.',
  },
  {
    label: 'Protocol design',
    detail: 'How the system is meant to work, and where that design fails under stress.',
  },
  {
    label: 'Tokenomics',
    detail: 'Who receives new tokens, what they control, and how much issuance dilutes holders.',
  },
  {
    label: 'Compliance',
    detail: 'Legal exposure, sanctions risk, and whether the people behind it can be identified.',
  },
  {
    label: 'Infrastructure',
    detail: 'Who runs the nodes, sequencers, or oracles, and what happens if they stop.',
  },
  {
    label: 'On-chain analysis',
    detail: 'Holder concentration, flows, and whether activity matches what the project claims.',
  },
]

const SEAT_SECONDS = 9

export function CouncilExpertiseCard({ className }: { className?: string }) {
  return (
    <SpotlightCard
      tone="amber"
      aria-labelledby="council-card-title"
      className={cn('flex h-full flex-col gap-5', className)}
    >
      <div className="space-y-2">
        <h3 id="council-card-title" className="text-xl font-bold">
          Vetted governor council
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Only selected reviewers with demonstrated expertise publish official scores. No
          anonymous crowd, no popularity contest.
        </p>
      </div>
      <ul
        aria-label="Review expertise"
        className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {areas.map((area, index) => (
          <li key={area.label} className="min-h-12">
            <span
              className="relative flex h-full flex-col justify-center gap-1 rounded-2xl border border-border bg-background/50 py-3 pl-10 pr-3.5 animate-seat-live motion-reduce:animate-none"
              style={{ animationDelay: `${index * (SEAT_SECONDS / areas.length)}s` }}
            >
              <span className="absolute left-3.5 top-3.5 text-[11px] tabular-nums text-primary">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-sm font-semibold">{area.label}</span>
              <span className="text-xs font-normal leading-snug text-muted-foreground">
                {area.detail}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </SpotlightCard>
  )
}
