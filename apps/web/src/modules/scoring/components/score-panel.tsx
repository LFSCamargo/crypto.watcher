import { ChartLineUp, TrendUp, TrendDown } from '@phosphor-icons/react'
import { useScore } from '../hooks/use-score'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '../../../components/ui'
import { cn } from '../../../lib/utils'
import {
  getCreditRatingGroupLabel,
  normalizeSafetyScore,
  resolveCreditRatingFromSafetyScore,
} from '../../../lib/ratings/credit-rating'
import { CreditRatingBadge } from './credit-rating-badge'

export function ScorePanel({ projectId }: { projectId: string }) {
  const { data, isLoading, isError } = useScore(projectId)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    )
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ChartLineUp size={18} className="text-muted-foreground" />
            Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No score available yet. The governor council may still be reviewing this project.
          </p>
        </CardContent>
      </Card>
    )
  }

  const score = normalizeSafetyScore(data.value)
  const creditRating = data.creditRating ?? resolveCreditRatingFromSafetyScore(score)
  const isInvestmentGrade = creditRating.group === 'investment_grade'

  return (
    <Card className={cn(isInvestmentGrade ? 'border-emerald-500/20' : 'border-amber-500/20')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ChartLineUp size={18} className="text-primary" />
          Risk rating
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CreditRatingBadge rating={creditRating} showGroup />

        <div className="flex items-end gap-3">
          <span
            className={cn(
              'text-4xl font-bold',
              isInvestmentGrade ? 'text-emerald-400' : 'text-amber-400',
            )}
          >
            {score.toFixed(1)}
          </span>
          <span className="mb-1 text-muted-foreground">/ 100 safety score</span>
          {isInvestmentGrade ? (
            <TrendUp size={24} className="mb-1 text-emerald-400" weight="bold" />
          ) : (
            <TrendDown size={24} className="mb-1 text-amber-400" weight="bold" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rating group</span>
            <span
              className={cn(
                'font-medium',
                isInvestmentGrade ? 'text-emerald-400' : 'text-amber-400',
              )}
            >
              {getCreditRatingGroupLabel(creditRating.group)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full transition-all duration-500',
                isInvestmentGrade
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400',
              )}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p>Round {data.round}</p>
          {data.breakdown && (
            <p className="mt-1">
              Based on {Object.keys(data.breakdown).length} review factors
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
