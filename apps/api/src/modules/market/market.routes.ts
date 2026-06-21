import { Router } from 'express'
import { asyncHandler, validate } from '../../core/http/validation'
import { getProjectMarketHandler } from './handlers'
import { MarketProjectParamsSchema } from './schemas'

export const marketRoutes = Router()

marketRoutes.get(
  '/projects/:slug',
  validate({ params: MarketProjectParamsSchema }),
  asyncHandler(getProjectMarketHandler),
)
