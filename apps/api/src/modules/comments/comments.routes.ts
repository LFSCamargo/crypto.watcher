import { Router } from 'express'
import { requireAuth } from '../../core/auth/session'
import { asyncHandler, HttpError, validate } from '../../core/http/validation'
import { commentsService } from './comments.service'
import {
  CommentParamsSchema,
  CreateCommentBodySchema,
  ProjectCommentsParamsSchema,
} from './comments.schema'

export const commentsRoutes = Router()

commentsRoutes.get(
  '/projects/:id/comments',
  validate({ params: ProjectCommentsParamsSchema }),
  asyncHandler(async (req, res) => {
    const params = ProjectCommentsParamsSchema.parse(req.params)
    res.json(await commentsService.listByProject(params.id))
  }),
)

commentsRoutes.post(
  '/projects/:id/comments',
  requireAuth,
  validate({ params: ProjectCommentsParamsSchema, body: CreateCommentBodySchema }),
  asyncHandler(async (req, res) => {
    const params = ProjectCommentsParamsSchema.parse(req.params)
    const body = CreateCommentBodySchema.parse(req.body)
    const comment = await commentsService.create({
      projectId: params.id,
      authorId: res.locals.user.id,
      body: body.body,
    })
    res.status(201).json(comment)
  }),
)

commentsRoutes.delete(
  '/comments/:id',
  requireAuth,
  validate({ params: CommentParamsSchema }),
  asyncHandler(async (req, res) => {
    const params = CommentParamsSchema.parse(req.params)
    const result = await commentsService.softDelete(params.id, res.locals.user.id)
    if (result === 'not_found') throw new HttpError(404, 'Comment not found')
    if (result === 'forbidden')
      throw new HttpError(403, 'Only the author can delete this comment')
    res.status(204).send()
  }),
)
