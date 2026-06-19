import { useQuery } from '@tanstack/react-query'
import { projectsApi } from '../api/projects.api'

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: projectsApi.list })
}

export function useProject(slug: string | undefined) {
  return useQuery({
    queryKey: ['projects', slug],
    queryFn: () => projectsApi.getBySlug(slug ?? ''),
    enabled: Boolean(slug),
  })
}
