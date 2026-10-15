import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '../api/projects.api'

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })
}
