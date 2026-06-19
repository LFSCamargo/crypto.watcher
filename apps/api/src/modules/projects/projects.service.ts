import type { Selectable } from 'kysely'
import { projectsRepository, type ListFilters } from './projects.repository'
import type { ProjectsTable, ProjectState } from '../../core/db/schema'

type ProjectRow = Selectable<ProjectsTable>

export const mapProject = (project: ProjectRow) => ({
  id: project.id,
  slug: project.slug,
  name: project.name,
  description: project.description,
  chainId: project.chain_id,
  tokenAddress: project.token_address,
  state: project.state,
  votingContractAddress: project.voting_contract_address,
  createdAt: project.created_at.toISOString(),
})

export const slugify = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const allowedTransitions: Record<ProjectState, ProjectState[]> = {
  in_analysis: ['ready'],
  ready: ['voting'],
  voting: ['closed'],
  closed: ['analyzed'],
  analyzed: [],
}

export const canTransitionProject = (from: ProjectState, to: ProjectState): boolean =>
  allowedTransitions[from].includes(to)

export const projectsService = {
  async list(filters: ListFilters) {
    const projects = await projectsRepository.list(filters)
    return projects.map(mapProject)
  },

  async getBySlug(slug: string) {
    const project = await projectsRepository.getBySlug(slug)
    return project ? mapProject(project) : undefined
  },

  async getById(id: string) {
    const project = await projectsRepository.getById(id)
    return project ? mapProject(project) : undefined
  },

  async create(input: {
    name: string
    description?: string
    chainId: number
    tokenAddress?: string
  }) {
    const project = await projectsRepository.create({
      ...input,
      slug: slugify(input.name),
    })
    return mapProject(project)
  },

  async update(
    id: string,
    input: Partial<{
      name: string
      description: string
      chainId: number
      tokenAddress: string
    }>,
  ) {
    const project = await projectsRepository.update(id, {
      ...input,
      ...(input.name ? { slug: slugify(input.name) } : {}),
    })
    return project ? mapProject(project) : undefined
  },

  async transition(
    id: string,
    input: { state: ProjectState; votingContractAddress?: string },
  ) {
    const current = await projectsRepository.getById(id)
    if (!current) return undefined
    const currentState = current.state
    if (!canTransitionProject(currentState, input.state)) {
      throw new Error(`Invalid project transition: ${currentState} -> ${input.state}`)
    }
    const project = await projectsRepository.transition(id, input)
    return project ? mapProject(project) : undefined
  },
}
