import { useId } from 'react'
import { RiShieldStarLine } from '@remixicon/react'
import { useScore } from '../hooks/use-score'
import { Skeleton } from '../../../components/ui'
import { cn } from '../../../lib/utils'
import {
  getCreditRatingGroupLabel,
  normalizeSafetyScore,
  resolveCreditRatingFromSafetyScore,
} from '../../../lib/ratings/credit-rating'
import { CreditRatingBadge } from './credit-rating-badge'

export function ScorePanel({ projectId }: { projectId: string }) {
  const titleId = useId()
  const { data, isLoading, isError } = useScore(projectId)

  const score = data ? normalizeSafetyScore(data.value) : 0
  const creditRating = data
    ? (data.creditRating ?? resolveCreditRatingFromSafetyScore(score))
    : undefined
  const isInvestmentGrade = creditRating?.group === 'investment_grade'

  return (
    <section aria-labelledby={titleId} className="glass-card glass-sheen space-y-4 p-6">
      <h2 id={titleId} className="flex items-center gap-2 text-base font-semibold">
        <RiShieldStarLine aria-hidden className="h-5 w-5 text-primary-strong" />
        Official safety score
      </h2>

      {isLoading ? (
        <div className="space-y-3" aria-label="Loading score">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      ) : isError || !data || !creditRating ? (
        <div className="space-y-1 text-sm">
          <p className="font-semibold">No official score yet</p>
          <p className="text-muted-foreground">
            Scores appear only after the governor council publishes its report.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
            <span
              className={cn(
                'text-5xl font-bold tabular-nums',
                isInvestmentGrade ? 'text-success-strong' : 'text-warning-strong',
              )}
            >
              {score.toFixed(1)}
            </span>
            <span className="mb-1.5 text-muted-foreground">/ 100</span>
            <CreditRatingBadge rating={creditRating} />
          </div>
          <div>
            <div aria-hidden className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full', isInvestmentGrade ? 'bg-success' : 'bg-warning')}
                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Higher is safer. {getCreditRatingGroupLabel(creditRating.group)} on the
              council&apos;s rating scale.
            </p>
          </div>
          <p className="rounded-2xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Published by the governor council · Round {data.round}
          </p>
        </>
      )}
    </section>
  )
}
