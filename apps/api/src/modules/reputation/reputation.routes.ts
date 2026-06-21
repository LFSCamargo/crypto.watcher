import { Router } from 'express'
import { asyncHandler, validate } from '../../core/http/validation'
import { getReputationHandler } from './handlers'
import { ReputationParamsSchema } from './schemas'

export const reputationRoutes = Router()

reputationRoutes.get(
  '/:address',
  validate({ params: ReputationParamsSchema }),
  asyncHandler(getReputationHandler),
)
