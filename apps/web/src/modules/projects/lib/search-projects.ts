import type { Project } from '../../../lib/api/types'
import { filterCuratedProjects } from './curated-projects'
import { formatProjectState } from './format'

export interface ProjectSearchResult {
  key: string
  title: string
  subtitle: string
  kind: 'reference' | 'project'
  to: string
  symbol?: string
  slug?: string
}

export const PROJECT_SEARCH_RESULT_LIMIT = 10

export function buildProjectSearchResults(
  query: string,
  liveProjects: Project[] | undefined,
  limit = PROJECT_SEARCH_RESULT_LIMIT,
): ProjectSearchResult[] {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return []

  const normalizedQuery = trimmedQuery.toLowerCase()

  const referenceResults: ProjectSearchResult[] = filterCuratedProjects(trimmedQuery).map(
    (project) => ({
      key: `reference-${project.slug}`,
      title: project.name,
      subtitle: `${project.symbol} · Safety score ${project.score}%`,
      kind: 'reference',
      to: `/app/reference/${project.slug}`,
      symbol: project.symbol,
      slug: project.slug,
    }),
  )

  const projectResults: ProjectSearchResult[] = (liveProjects ?? [])
    .filter((project) =>
      [project.name, project.slug, project.description ?? ''].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    )
    .map((project) => ({
      key: `project-${project.id}`,
      title: project.name,
      subtitle: formatProjectState(project.state),
      kind: 'project',
      to: `/app/projects/${project.slug}`,
      slug: project.slug,
    }))

  return [...referenceResults, ...projectResults].slice(0, limit)
}
