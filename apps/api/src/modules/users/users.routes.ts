import { Router } from 'express'
import { requireAuth } from '../../core/auth/session'
import { asyncHandler, HttpError, validate } from '../../core/http/validation'
import { usersService } from './users.service'
import { UpdateMeBodySchema, UserIdentifierParamsSchema } from './users.schema'

export const usersRoutes = Router()

usersRoutes.get(
  '/:identifier',
  validate({ params: UserIdentifierParamsSchema }),
  asyncHandler(async (req, res) => {
    const params = UserIdentifierParamsSchema.parse(req.params)
    const { identifier } = params

    const user = identifier.startsWith('0x')
      ? await usersService.getByAddress(identifier)
      : await usersService.getByNickname(identifier)

    if (!user) throw new HttpError(404, 'User not found')
    res.json(user)
  }),
)

usersRoutes.patch(
  '/me',
  requireAuth,
  validate({ body: UpdateMeBodySchema }),
  asyncHandler(async (req, res) => {
    const body = UpdateMeBodySchema.parse(req.body)
    const user = await usersService.updateMe(res.locals.user.id, body)
    if (!user) throw new HttpError(404, 'User not found')
    res.json(user)
  }),
)
