import { useQuery } from '@tanstack/react-query'
import type { ProjectState } from '../../../lib/api/types'
import { projectsApi } from '../api/projects.api'

export function useProjects(params?: { state?: ProjectState; q?: string }) {
  return useQuery({
    queryKey: ['projects', params?.state, params?.q],
    queryFn: () => projectsApi.list(params),
    retry: false,
    staleTime: 30_000,
  })
}

export function useProject(slug: string | undefined) {
  return useQuery({
    queryKey: ['projects', slug],
    queryFn: () => projectsApi.getBySlug(slug ?? ''),
    enabled: Boolean(slug),
  })
}
