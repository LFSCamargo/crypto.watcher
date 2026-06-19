import { apiFetch } from '../../../lib/api/client'
import type { Score } from '../../../lib/api/types'

export const scoringApi = {
  current: (projectId: string) => apiFetch<Score>(`/projects/${projectId}/score`),
  history: (projectId: string) => apiFetch<Score[]>(`/projects/${projectId}/score/history`),
}
