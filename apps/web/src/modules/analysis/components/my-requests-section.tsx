import { Skeleton } from '../../../components/ui'
import { useMyAnalysisRequests } from '../hooks/use-my-analysis-requests'
import { RequestStatusBadge } from './request-status-badge'

const submittedFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium' })

export function MyRequestsSection() {
  const { data, isLoading, isError } = useMyAnalysisRequests()

  return (
    <section
      aria-labelledby="my-requests-title"
      className="glass-card-flat space-y-4 p-6"
    >
      <h2 id="my-requests-title" className="text-base font-semibold">
        Your requests
      </h2>
      {isLoading ? (
        <Skeleton className="h-16 w-full rounded-2xl" />
      ) : isError ? (
        <p className="text-sm text-muted-foreground">
          Your requests couldn&apos;t be loaded right now.
        </p>
      ) : data?.items.length ? (
        <ul className="divide-y divide-border/60">
          {data.items.map((request) => (
            <li
              key={request.id}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{request.projectName}</p>
                <p className="text-xs text-muted-foreground">
                  Submitted{' '}
                  <time dateTime={request.createdAt}>
                    {submittedFormat.format(new Date(request.createdAt))}
                  </time>
                </p>
              </div>
              <RequestStatusBadge status={request.status} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          You haven&apos;t requested a review yet.
        </p>
      )}
    </section>
  )
}
