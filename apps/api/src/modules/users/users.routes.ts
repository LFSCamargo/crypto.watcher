import { Router } from 'express'
import { requireAuth } from '../../core/auth/session'
import { asyncHandler, HttpError, validate } from '../../core/http/validation'
import { usersService } from './users.service'
import { AddressParamsSchema, UpdateMeBodySchema } from './users.schema'

export const usersRoutes = Router()

usersRoutes.get(
  '/:address',
  validate({ params: AddressParamsSchema }),
  asyncHandler(async (req, res) => {
    const params = AddressParamsSchema.parse(req.params)
    const user = await usersService.getByAddress(params.address)
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
