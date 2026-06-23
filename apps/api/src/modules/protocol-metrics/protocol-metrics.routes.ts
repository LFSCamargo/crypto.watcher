import { Router } from 'express'
import { asyncHandler, validate } from '../../core/http/validation'
import { getProjectProtocolMetricsHandler } from './handlers'
import { ProtocolMetricsProjectParamsSchema } from './schemas'

export const protocolMetricsRoutes = Router()

protocolMetricsRoutes.get(
  '/projects/:slug',
  validate({ params: ProtocolMetricsProjectParamsSchema }),
  asyncHandler(getProjectProtocolMetricsHandler),
)
