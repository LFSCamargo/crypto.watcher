import { useMutation, useQueryClient } from '@tanstack/react-query'
import { analysisRequestsApi } from '../api/analysis-requests.api'

export function useCreateAnalysisRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: analysisRequestsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['analysis-requests'] }),
  })
}
