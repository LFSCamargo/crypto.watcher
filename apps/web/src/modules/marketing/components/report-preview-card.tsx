import { RiShieldCheckLine, RiTeamLine } from '@remixicon/react'
import { Badge } from '../../../components/ui'
import { resolveCreditRatingFromSafetyScore } from '../../../lib/ratings/credit-rating'
import { useCountUp } from '../hooks/use-count-up'

const EXAMPLE_SCORE = 82

const findings = [
  { area: 'Smart contract security', score: 88 },
  { area: 'Protocol design', score: 84 },
  { area: 'Tokenomics', score: 74 },
  { area: 'Infrastructure', score: 81 },
]

export function ReportPreviewCard() {
  const rating = resolveCreditRatingFromSafetyScore(EXAMPLE_SCORE)
  const displayedScore = useCountUp(EXAMPLE_SCORE)

  return (
    <figure
      aria-label="Illustrative report preview"
      className="glass-card glass-sheen relative w-full max-w-md overflow-hidden rounded-3xl p-6 text-left md:p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 motion-reduce:hidden"
      >
        <div className="absolute inset-0 animate-hero-scan">
          <div className="absolute inset-x-0 bottom-0 h-20 border-b-2 border-primary/80 bg-gradient-to-b from-transparent to-primary/20" />
        </div>
      </div>

      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-muted-foreground">
            Safety report
          </p>
          <p className="mt-1 text-lg font-bold">Example Lending Protocol</p>
        </div>
        <span className="animate-stamp motion-reduce:animate-none">
          <Badge variant="success">Report published</Badge>
        </span>
      </div>

      <div className="mb-6 flex items-end gap-3">
        <p className="text-5xl font-bold tabular-nums leading-none">
          <span aria-hidden data-score>
            {displayedScore}
          </span>
          <span className="sr-only">Example score: {EXAMPLE_SCORE} out of 100</span>
        </p>
        <p className="pb-1 text-sm font-semibold text-muted-foreground">/ 100</p>
        <span className="ml-auto rounded-full border border-foreground/10 bg-background/70 px-3 py-1 text-sm font-bold">
          {rating.sp}
        </span>
      </div>

      <ul className="space-y-3">
        {findings.map((finding, index) => (
          <li key={finding.area}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">{finding.area}</span>
              <span className="font-semibold tabular-nums">{finding.score}</span>
            </div>
            <div aria-hidden className="h-1.5 rounded-full bg-foreground/10">
              <div
                className="h-full origin-left animate-bar-fill rounded-full bg-chart-1 motion-reduce:animate-none"
                style={{
                  width: `${finding.score}%`,
                  animationDelay: `${0.4 + index * 0.18}s`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center gap-4 border-t border-foreground/10 pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <RiTeamLine className="h-4 w-4" aria-hidden />
          Governor council
        </span>
        <span className="inline-flex items-center gap-1.5">
          <RiShieldCheckLine className="h-4 w-4" aria-hidden />
          Higher score = safer
        </span>
      </div>

      <figcaption className="mt-4 text-xs font-medium text-muted-foreground">
        Illustrative example — not an assessment of a real project.
      </figcaption>
    </figure>
  )
}
