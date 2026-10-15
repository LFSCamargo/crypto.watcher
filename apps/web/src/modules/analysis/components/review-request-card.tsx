import { useId } from 'react'
import { RiExternalLinkLine } from '@remixicon/react'
import type { AnalysisRequest } from '../api/analysis-requests.api'
import { requestStatusMeta } from '../lib/request-status'
import { RequestStatusBadge } from './request-status-badge'
import { RequestTriageActions } from './request-triage-actions'

const submittedFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium' })

export function ReviewRequestCard({
  request,
  canTriage,
}: {
  request: AnalysisRequest
  canTriage: boolean
}) {
  const titleId = useId()
  const meta = requestStatusMeta(request.status)

  return (
    <article aria-labelledby={titleId} className="glass-card-flat space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 id={titleId} className="text-lg font-semibold">
            {request.projectName}
          </h3>
          <a
            href={request.projectUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-1 text-sm font-medium text-primary-strong underline-offset-4 hover:underline"
          >
            <span className="truncate">{request.projectUrl}</span>
            <RiExternalLinkLine aria-hidden className="h-3.5 w-3.5 shrink-0" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
        <RequestStatusBadge status={request.status} />
      </div>
      <p className="line-clamp-3 text-sm text-muted-foreground">{request.description}</p>
      {request.reviewNotes ? (
        <div className="rounded-2xl bg-muted/50 p-3 text-sm">
          <p className="font-semibold">Council notes</p>
          <p className="mt-1 text-muted-foreground">{request.reviewNotes}</p>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <span>
          Submitted{' '}
          <time dateTime={request.createdAt}>
            {submittedFormat.format(new Date(request.createdAt))}
          </time>
        </span>
        <span>{meta.nextStep}</span>
      </div>
      {canTriage ? <RequestTriageActions request={request} /> : null}
    </article>
  )
}
