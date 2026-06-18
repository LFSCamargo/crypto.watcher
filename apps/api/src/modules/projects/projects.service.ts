import { projectsRepository, type ListFilters } from './projects.repository'

export const slugify = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const projectsService = {
  list: (filters: ListFilters) => projectsRepository.list(filters),

  getBySlug: (slug: string) => projectsRepository.getBySlug(slug),

  create: (input: {
    name: string
    description?: string
    chainId: number
    tokenAddress?: string
  }) => projectsRepository.create({ ...input, slug: slugify(input.name) }),
}
