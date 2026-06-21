import {
  RiAlertLine,
  RiCheckboxCircleLine,
  RiExternalLinkLine,
  RiShieldCheckLine,
  RiShieldLine,
} from '@remixicon/react'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui'
import { cn } from '../../../lib/utils'
import { getVerdictLabel } from '../lib/curated-project-reviews'
import type {
  ExternalReviewStatus,
  ExternalSecurityReview,
  ProjectReviewProfile,
  SafetyVerdict,
} from '../lib/project-review-types'

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

export function ProjectReviewFactors({ profile }: { profile: ProjectReviewProfile }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <RiCheckboxCircleLine className="h-4 w-4 text-emerald-500" />
            Why it&apos;s rated well
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {profile.strengths.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <RiAlertLine className="h-4 w-4 text-amber-500" />
            Risks to understand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {profile.risks.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
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

export function ProjectGovernorAssessment({ profile }: { profile: ProjectReviewProfile }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <RiShieldLine className="h-4 w-4 text-primary" />
          Governor council notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>{profile.governorNotes}</p>
        <p>
          Reviewed by{' '}
          <span className="font-semibold text-foreground">Crypto Watcher Governor Council</span>
          . Scores reflect expert analysis — not community voting or token-weighted input.
        </p>
      </CardContent>
    </Card>
  )
}

export function ProjectReviewDetail({ profile }: { profile: ProjectReviewProfile }) {
  return (
    <div className="space-y-6">
      <ProjectSafetyVerdict profile={profile} />
      <ProjectReviewFactors profile={profile} />
      <ProjectSecurityAudits profile={profile} />
      <ProjectGovernorAssessment profile={profile} />
    </div>
  )
}
