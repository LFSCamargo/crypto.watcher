import { useMutation, useQueryClient } from '@tanstack/react-query'
import { analysisRequestsApi } from '../api/analysis-requests.api'

export function useUpdateAnalysisRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: analysisRequestsApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['analysis-requests'] }),
  })
}
