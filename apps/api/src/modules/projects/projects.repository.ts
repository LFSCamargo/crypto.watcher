import { db } from '../../core/db'
import type { ProjectState } from '../../core/db/schema'

export interface ListFilters {
  state?: ProjectState
  chainId?: number
  q?: string
  page: number
  limit: number
}

export const projectsRepository = {
  async list(filters: ListFilters) {
    let query = db.selectFrom('projects').selectAll()
    if (filters.state) query = query.where('state', '=', filters.state)
    if (filters.chainId) query = query.where('chain_id', '=', filters.chainId)
    if (filters.q) query = query.where('name', 'ilike', `%${filters.q}%`)
    return query
      .orderBy('created_at', 'desc')
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit)
      .execute()
  },

  async getBySlug(slug: string) {
    return db
      .selectFrom('projects')
      .selectAll()
      .where('slug', '=', slug)
      .executeTakeFirst()
  },

  async create(input: {
    slug: string
    name: string
    description?: string
    chainId: number
    tokenAddress?: string
  }) {
    return db
      .insertInto('projects')
      .values({
        slug: input.slug,
        name: input.name,
        description: input.description ?? null,
        chain_id: input.chainId,
        token_address: input.tokenAddress ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  },
}
