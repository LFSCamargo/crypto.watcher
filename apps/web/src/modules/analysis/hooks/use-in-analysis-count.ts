import { useMemo } from 'react'
import { useProjects } from '../../projects/hooks/use-projects'
import { useReviewRequests } from './use-review-requests'

const OPEN_STATUSES = new Set(['pending', 'in_review'])

/** Open review requests plus council projects in analysis; undefined until both load. */
export function useInAnalysisCount() {
  const requests = useReviewRequests()
  const projects = useProjects({ state: 'in_analysis' })

  return useMemo(() => {
    if (!requests.data || !projects.data) return undefined
    const openRequests = requests.data.items.filter((request) =>
      OPEN_STATUSES.has(request.status),
    ).length
    return openRequests + projects.data.length
  }, [requests.data, projects.data])
}
