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
    if (filters.q) {
      const pattern = `%${filters.q}%`
      query = query.where((eb) =>
        eb.or([
          eb('name', 'ilike', pattern),
          eb('description', 'ilike', pattern),
          eb('slug', 'ilike', pattern),
        ]),
      )
    }
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

  async getById(id: string) {
    return db.selectFrom('projects').selectAll().where('id', '=', id).executeTakeFirst()
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

  async update(
    id: string,
    input: Partial<{
      name: string
      slug: string
      description: string
      chainId: number
      tokenAddress: string
    }>,
  ) {
    return db
      .updateTable('projects')
      .set({
        ...(input.name ? { name: input.name } : {}),
        ...(input.slug ? { slug: input.slug } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.chainId !== undefined ? { chain_id: input.chainId } : {}),
        ...(input.tokenAddress !== undefined
          ? { token_address: input.tokenAddress }
          : {}),
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  },

  async transition(
    id: string,
    input: { state: ProjectState; votingContractAddress?: string },
  ) {
    return db
      .updateTable('projects')
      .set({
        state: input.state,
        ...(input.votingContractAddress
          ? { voting_contract_address: input.votingContractAddress }
          : {}),
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  },
}
