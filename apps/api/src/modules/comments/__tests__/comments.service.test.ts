import { beforeEach, describe, expect, it, vi } from 'vitest'
import { commentsService, mapComment } from '../comments.service'

vi.mock('../comments.repository', () => ({
  commentsRepository: {
    listByProject: vi.fn(),
    create: vi.fn(),
    getById: vi.fn(),
    softDelete: vi.fn(),
  },
}))

import { commentsRepository } from '../comments.repository'

const now = new Date('2024-01-01T00:00:00.000Z')

const row = {
  id: '22222222-2222-4222-8222-222222222222',
  project_id: '11111111-1111-4111-8111-111111111111',
  author_id: '33333333-3333-4333-8333-333333333333',
  body: 'hello',
  comment_fee_paid: false,
  created_at: now,
  deleted_at: null,
}

describe('commentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mapComment maps database rows', () => {
    expect(mapComment(row)).toEqual({
      id: row.id,
      projectId: row.project_id,
      authorId: row.author_id,
      body: row.body,
      createdAt: now.toISOString(),
    })
  })

  it('listByProject maps repository rows', async () => {
    vi.mocked(commentsRepository.listByProject).mockResolvedValue([row])

    const result = await commentsService.listByProject(row.project_id)

    expect(result).toHaveLength(1)
    expect(result[0]?.body).toBe('hello')
  })

  it('create persists and maps a comment', async () => {
    vi.mocked(commentsRepository.create).mockResolvedValue(row)

    const result = await commentsService.create({
      projectId: row.project_id,
      authorId: row.author_id,
      body: row.body,
    })

    expect(result.id).toBe(row.id)
  })

  it('softDelete returns not_found when comment is missing', async () => {
    vi.mocked(commentsRepository.getById).mockResolvedValue(undefined)

    await expect(commentsService.softDelete(row.id, row.author_id)).resolves.toBe('not_found')
  })

  it('softDelete returns forbidden for non-authors', async () => {
    vi.mocked(commentsRepository.getById).mockResolvedValue(row)

    await expect(commentsService.softDelete(row.id, 'other-user')).resolves.toBe('forbidden')
  })

  it('softDelete deletes comments authored by the requester', async () => {
    vi.mocked(commentsRepository.getById).mockResolvedValue(row)
    vi.mocked(commentsRepository.softDelete).mockResolvedValue(row)

    await expect(commentsService.softDelete(row.id, row.author_id)).resolves.toBe('deleted')
    expect(commentsRepository.softDelete).toHaveBeenCalledWith(row.id)
  })
})
