import { Badge } from '../../../components/ui'
import { cn } from '../../../lib/utils'
import type { CreditRating, CreditRatingGroup } from '../../../lib/ratings/credit-rating'
import {
  formatCreditRatingLabel,
  getCreditRatingGroupLabel,
} from '../../../lib/ratings/credit-rating'

function groupBadgeVariant(group: CreditRatingGroup, sp: CreditRating['sp']) {
  if (sp === 'D') return 'destructive' as const
  return group === 'investment_grade' ? ('success' as const) : ('warning' as const)
}

interface CreditRatingBadgeProps {
  rating: CreditRating
  /** Show the investment / speculative group label under the agency grades. */
  showGroup?: boolean
  className?: string
}

export function CreditRatingBadge({
  rating,
  showGroup = false,
  className,
}: CreditRatingBadgeProps) {
  const variant = groupBadgeVariant(rating.group, rating.sp)

  return (
    <div className={cn('inline-flex flex-col gap-1', className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant={variant} className="rounded-full font-semibold tabular-nums">
          S&amp;P {rating.sp}
        </Badge>
        <Badge variant={variant} className="rounded-full font-semibold tabular-nums">
          Moody&apos;s {rating.moodys}
        </Badge>
      </div>
      {showGroup ? (
        <p className="text-xs text-muted-foreground">
          {getCreditRatingGroupLabel(rating.group)} · {formatCreditRatingLabel(rating)}
        </p>
      ) : null}
    </div>
  )
}
