import { RiExternalLinkLine, RiShieldCheckLine } from '@remixicon/react'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui'
import type {
  ExternalReviewStatus,
  ExternalSecurityReview,
  ProjectReviewProfile,
} from '../lib/project-review-types'

function reviewStatusLabel(status: ExternalReviewStatus): string {
  switch (status) {
    case 'passed':
      return 'Passed'
    case 'passed_with_issues':
      return 'Passed with findings'
    case 'monitoring':
      return 'Ongoing monitoring'
    case 'informational':
      return 'Informational'
  }
}

function reviewStatusVariant(status: ExternalReviewStatus) {
  switch (status) {
    case 'passed':
      return 'success' as const
    case 'passed_with_issues':
      return 'warning' as const
    case 'monitoring':
      return 'info' as const
    case 'informational':
      return 'secondary' as const
  }
}

function SecurityAuditCard({ review }: { review: ExternalSecurityReview }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-semibold">
          {review.provider}
        </Badge>
        <Badge variant={reviewStatusVariant(review.status)}>{reviewStatusLabel(review.status)}</Badge>
        <span className="text-xs text-muted-foreground">{review.completedAt}</span>
      </div>
      <p className="font-medium">{review.title}</p>
      {review.scope ? (
        <p className="mt-1 text-xs text-muted-foreground">Scope: {review.scope}</p>
      ) : null}
      <a
        href={review.url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        View report
        <RiExternalLinkLine className="h-4 w-4" />
      </a>
    </div>
  )
}

export function ProjectSecurityAudits({ profile }: { profile: ProjectReviewProfile }) {
  const hasReviews = profile.externalReviews.length > 0

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <RiShieldCheckLine className="h-4 w-4 text-primary" />
          External security reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasReviews ? (
          <p className="text-sm text-muted-foreground">
            No specific public smart contract audit report from a recognized security firm is
            currently indexed for this project. The council score reflects category risk
            factors, operational history, liquidity depth, and the absence of major known
            incidents. Request a formal review for detailed coverage.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Specific security reviews and finance attestations from recognized firms. These
              reports are the primary source for understanding why the protocol is considered
              safe (or not).
            </p>
            <div className="space-y-3">
              {profile.externalReviews.map((review) => (
                <SecurityAuditCard key={`${review.provider}-${review.title}`} review={review} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
