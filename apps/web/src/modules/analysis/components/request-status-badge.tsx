import { Badge } from '../../../components/ui'
import type { AnalysisRequest } from '../api/analysis-requests.api'
import { requestStatusMeta } from '../lib/request-status'

export function RequestStatusBadge({ status }: { status: AnalysisRequest['status'] }) {
  const meta = requestStatusMeta(status)
  return (
    <Badge variant={meta.tone} className="shrink-0 rounded-full">
      {meta.label}
    </Badge>
  )
}
