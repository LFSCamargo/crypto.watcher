import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProjectState } from '../../../lib/api/types'
import { projectsApi } from '../api/projects.api'

export function useTransitionProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, state }: { id: string; state: ProjectState }) =>
      projectsApi.transition(id, { state }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })
}
