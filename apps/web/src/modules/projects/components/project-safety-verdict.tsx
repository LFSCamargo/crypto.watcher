import { Badge, Card, CardContent } from '../../../components/ui'
import { cn } from '../../../lib/utils'
import { getVerdictLabel } from '../lib/curated-project-reviews'
import type { ProjectReviewProfile, SafetyVerdict } from '../lib/project-review-types'

function verdictBadgeVariant(verdict: SafetyVerdict) {
  switch (verdict) {
    case 'low_risk':
      return 'success' as const
    case 'moderate_risk':
      return 'secondary' as const
    case 'elevated_risk':
      return 'warning' as const
    case 'caution':
      return 'destructive' as const
  }
}

export function ProjectSafetyVerdict({ profile }: { profile: ProjectReviewProfile }) {
  return (
    <Card
      className={cn(
        'rounded-2xl border',
        profile.verdict === 'low_risk' && 'border-emerald-500/20 bg-emerald-500/5',
        profile.verdict === 'moderate_risk' && 'border-primary/20 bg-primary/5',
        profile.verdict === 'elevated_risk' && 'border-amber-500/20 bg-amber-500/5',
        profile.verdict === 'caution' && 'border-red-500/20 bg-red-500/5',
      )}
    >
      <CardContent className="space-y-3 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={verdictBadgeVariant(profile.verdict)}>
            {getVerdictLabel(profile.verdict)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Reviewed {profile.lastReviewedAt} · {profile.methodologyVersion}
          </span>
        </div>
        <h2 className="text-lg font-semibold leading-snug">{profile.headline}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{profile.summary}</p>
      </CardContent>
    </Card>
  )
}
