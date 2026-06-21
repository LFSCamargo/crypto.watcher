import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '../../../core/http/validation'
import { mockRequest, mockResponse } from '../../../test/http-mocks'
import { createCommentHandler } from '../handlers/create-comment.handler'
import { deleteCommentHandler } from '../handlers/delete-comment.handler'
import { listProjectCommentsHandler } from '../handlers/list-project-comments.handler'

vi.mock('../comments.service', () => ({
  commentsService: {
    listByProject: vi.fn(),
    create: vi.fn(),
    softDelete: vi.fn(),
  },
}))

import { commentsService } from '../comments.service'

const projectId = '11111111-1111-4111-8111-111111111111'
const commentId = '22222222-2222-4222-8222-222222222222'
const authorId = '33333333-3333-4333-8333-333333333333'

describe('comments handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listProjectCommentsHandler returns project comments', async () => {
    const comments = [{ id: commentId, projectId, authorId, body: 'hello', createdAt: '' }]
    vi.mocked(commentsService.listByProject).mockResolvedValue(comments)

    const req = mockRequest({ params: { id: projectId } })
    const res = mockResponse()

    await listProjectCommentsHandler(req, res)

    expect(commentsService.listByProject).toHaveBeenCalledWith(projectId)
    expect(res.body).toEqual(comments)
  })

  it('createCommentHandler creates a comment for the authenticated user', async () => {
    const comment = { id: commentId, projectId, authorId, body: 'new', createdAt: '' }
    vi.mocked(commentsService.create).mockResolvedValue(comment)

    const req = mockRequest({ params: { id: projectId }, body: { body: 'new' } })
    const res = mockResponse()
    res.locals.user = { id: authorId }

    await createCommentHandler(req, res)

    expect(commentsService.create).toHaveBeenCalledWith({
      projectId,
      authorId,
      body: 'new',
    })
    expect(res.statusCode).toBe(201)
    expect(res.body).toEqual(comment)
  })

  it('deleteCommentHandler returns 404 when comment is missing', async () => {
    vi.mocked(commentsService.softDelete).mockResolvedValue('not_found')

    const req = mockRequest({ params: { id: commentId } })
    const res = mockResponse()
    res.locals.user = { id: authorId }

    await expect(deleteCommentHandler(req, res)).rejects.toEqual(
      new HttpError(404, 'Comment not found'),
    )
  })

  it('deleteCommentHandler returns 403 when requester is not the author', async () => {
    vi.mocked(commentsService.softDelete).mockResolvedValue('forbidden')

    const req = mockRequest({ params: { id: commentId } })
    const res = mockResponse()
    res.locals.user = { id: authorId }

    await expect(deleteCommentHandler(req, res)).rejects.toEqual(
      new HttpError(403, 'Only the author can delete this comment'),
    )
  })

  it('deleteCommentHandler succeeds for the author', async () => {
    vi.mocked(commentsService.softDelete).mockResolvedValue('deleted')

    const req = mockRequest({ params: { id: commentId } })
    const res = mockResponse()
    res.locals.user = { id: authorId }

    await deleteCommentHandler(req, res)

    expect(res.statusCode).toBe(204)
  })
})
