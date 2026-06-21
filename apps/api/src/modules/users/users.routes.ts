import { Router } from 'express'
import { requireAuth } from '../../core/auth/session'
import { asyncHandler, validate } from '../../core/http/validation'
import { getUserByIdentifierHandler, updateMeHandler } from './handlers'
import { UpdateMeBodySchema, UserIdentifierParamsSchema } from './schemas'

export const usersRoutes = Router()

usersRoutes.get(
  '/:identifier',
  validate({ params: UserIdentifierParamsSchema }),
  asyncHandler(getUserByIdentifierHandler),
)

usersRoutes.patch(
  '/me',
  requireAuth,
  validate({ body: UpdateMeBodySchema }),
  asyncHandler(updateMeHandler),
)
