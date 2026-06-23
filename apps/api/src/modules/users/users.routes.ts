import { Router } from 'express'
import { requireAuth } from '../../core/auth/session'
import { asyncHandler, validate } from '../../core/http/validation'
import { getMeHandler, getUserByIdentifierHandler, updateMeHandler } from './handlers'
import { UpdateMeBodySchema, UserIdentifierParamsSchema } from './schemas'

export const usersRoutes = Router()

// Register /me before /:identifier — otherwise Express treats "me" as a nickname lookup.
usersRoutes.get('/me', requireAuth, asyncHandler(getMeHandler))

usersRoutes.patch(
  '/me',
  requireAuth,
  validate({ body: UpdateMeBodySchema }),
  asyncHandler(updateMeHandler),
)

usersRoutes.get(
  '/:identifier',
  validate({ params: UserIdentifierParamsSchema }),
  asyncHandler(getUserByIdentifierHandler),
)
