import { Router } from 'express'
import { requireAuth } from '../../core/auth/session'
import { asyncHandler, validate } from '../../core/http/validation'
import {
  createCommentHandler,
  deleteCommentHandler,
  listProjectCommentsHandler,
} from './handlers'
import {
  CommentParamsSchema,
  CreateCommentBodySchema,
  ProjectCommentsParamsSchema,
} from './schemas'

export const commentsRoutes = Router()

commentsRoutes.get(
  '/projects/:id/comments',
  validate({ params: ProjectCommentsParamsSchema }),
  asyncHandler(listProjectCommentsHandler),
)

commentsRoutes.post(
  '/projects/:id/comments',
  requireAuth,
  validate({ params: ProjectCommentsParamsSchema, body: CreateCommentBodySchema }),
  asyncHandler(createCommentHandler),
)

commentsRoutes.delete(
  '/comments/:id',
  requireAuth,
  validate({ params: CommentParamsSchema }),
  asyncHandler(deleteCommentHandler),
)
