import { ChartLineUp, TrendUp, TrendDown } from '@phosphor-icons/react'
import { useScore } from '../hooks/use-score'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '../../../components/ui'
import { cn } from '../../../lib/utils'

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
            No score available yet. Voting may still be in progress.
          </p>
        </CardContent>
      </Card>
    )
  }

  const score = parseFloat(data.value)
  const isPositive = score >= 50

  return (
    <Card className={cn(isPositive ? 'border-emerald-500/20' : 'border-red-500/20')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ChartLineUp size={18} className="text-primary" />
          Risk Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-3">
          <span className={cn('text-4xl font-bold', isPositive ? 'text-emerald-400' : 'text-red-400')}>
            {score.toFixed(1)}
          </span>
          <span className="mb-1 text-muted-foreground">/ 100</span>
          {isPositive ? (
            <TrendUp size={24} className="mb-1 text-emerald-400" weight="bold" />
          ) : (
            <TrendDown size={24} className="mb-1 text-red-400" weight="bold" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Risk Level</span>
            <span className={cn('font-medium', isPositive ? 'text-emerald-400' : 'text-red-400')}>
              {score >= 70 ? 'Low Risk' : score >= 40 ? 'Medium Risk' : 'High Risk'}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full transition-all duration-500',
                isPositive
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-red-500 to-red-400',
              )}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p>Round {data.round}</p>
          {data.breakdown && (
            <p className="mt-1">
              Based on {Object.keys(data.breakdown).length} voting factors
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
