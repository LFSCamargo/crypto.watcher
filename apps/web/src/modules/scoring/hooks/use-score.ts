import { useQuery } from '@tanstack/react-query'
import { scoringApi } from '../api/scoring.api'

export function useScore(projectId: string | undefined) {
  return useQuery({
    queryKey: ['score', projectId],
    queryFn: () => scoringApi.current(projectId ?? ''),
    enabled: Boolean(projectId),
    retry: false,
  })
}

export function useScoreHistory(projectId: string | undefined) {
  return useQuery({
    queryKey: ['score-history', projectId],
    queryFn: () => scoringApi.history(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}
