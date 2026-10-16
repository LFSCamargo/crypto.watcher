import { useQuery } from '@tanstack/react-query'
import { analysisRequestsApi } from '../api/analysis-requests.api'

export function useReviewRequests() {
  return useQuery({
    queryKey: ['analysis-requests'],
    queryFn: () => analysisRequestsApi.list(),
    retry: false,
  })
}
