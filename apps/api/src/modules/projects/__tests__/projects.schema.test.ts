import { describe, expect, it } from 'vitest'
import { CreateProjectBodySchema, ListProjectsQuerySchema } from '../schemas'

describe('project schemas', () => {
  it('coerces list query pagination values', () => {
    const query = ListProjectsQuerySchema.parse({
      page: '2',
      limit: '50',
      chainId: '1',
    })

    expect(query).toEqual({ page: 2, limit: 50, chainId: 1 })
  })

  it('rejects empty project names', () => {
    const result = CreateProjectBodySchema.safeParse({
      name: '',
      chainId: 1,
    })

    expect(result.success).toBe(false)
  })
})
