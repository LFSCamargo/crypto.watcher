import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commentsApi } from '../api/comments.api'

export function useComments(projectId: string | undefined) {
  return useQuery({
    queryKey: ['comments', projectId],
    queryFn: () => commentsApi.listByProject(projectId ?? ''),
    enabled: Boolean(projectId),
  })
}

export function useCreateComment(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: string) => commentsApi.create(projectId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', projectId] })
    },
  })
}
