import { REQUEST_STATUS_LEGEND, requestStatusMeta } from '../lib/request-status'
import { RequestStatusBadge } from './request-status-badge'

export function RequestStatusLegend() {
  return (
    <section
      aria-labelledby="request-status-legend-title"
      className="glass-card-flat space-y-4 p-6"
    >
      <div className="space-y-1">
        <h2 id="request-status-legend-title" className="text-base font-semibold">
          What request statuses mean
        </h2>
        <p className="text-sm text-muted-foreground">
          A request is not a review. Accepted requests go through the council&apos;s
          analysis, and a score appears only when the council publishes its report.
        </p>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {REQUEST_STATUS_LEGEND.map((status) => (
          <div key={status} className="space-y-1.5">
            <dt>
              <RequestStatusBadge status={status} />
            </dt>
            <dd className="text-sm text-muted-foreground">
              {requestStatusMeta(status).nextStep}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
