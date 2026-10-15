import type { ProjectState } from '../../../lib/api/types'
import { Badge } from '../../../components/ui'
import { projectStateMeta } from '../lib/format'

export function ProjectStatusBadge({
  state,
  className,
}: {
  state: ProjectState
  className?: string
}) {
  const meta = projectStateMeta(state)
  return (
    <Badge variant={meta.tone} className={className}>
      {meta.label}
    </Badge>
  )
}
