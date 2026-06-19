import { apiFetch, apiPatch, apiPost } from '../../../lib/api/client'
import type { Project, ProjectState } from '../../../lib/api/types'

export const projectsApi = {
  list: () => apiFetch<Project[]>('/projects'),
  getBySlug: (slug: string) => apiFetch<Project>(`/projects/${slug}`),
  create: (input: {
    name: string
    description?: string
    chainId: number
    tokenAddress?: string
  }) => apiPost<Project>('/projects', input),
  update: (
    id: string,
    input: Partial<{
      name: string
      description: string
      chainId: number
      tokenAddress: string
    }>,
  ) => apiPatch<Project>(`/projects/${id}`, input),
  transition: (
    id: string,
    input: { state: ProjectState; votingContractAddress?: string },
  ) => apiPost<Project>(`/projects/${id}/transition`, input),
}
