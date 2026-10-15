import { useQuery } from '@tanstack/react-query'
import { analysisRequestsApi } from '../api/analysis-requests.api'

export function useMyAnalysisRequests() {
  return useQuery({
    queryKey: ['analysis-requests', 'mine'],
    queryFn: analysisRequestsApi.listMine,
    retry: false,
  })
}
