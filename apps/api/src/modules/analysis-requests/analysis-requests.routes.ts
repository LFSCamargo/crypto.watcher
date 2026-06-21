import { Router } from 'express'
import { requireAuth, requireTeamOrAdmin } from '../../core/auth/session'
import { asyncHandler, validate } from '../../core/http/validation'
import {
  createAnalysisRequestHandler,
  listAnalysisRequestsHandler,
  listMyAnalysisRequestsHandler,
  updateAnalysisRequestHandler,
} from './handlers'
import {
  AnalysisRequestParamsSchema,
  CreateAnalysisRequestBodySchema,
  ListAnalysisRequestsQuerySchema,
  UpdateAnalysisRequestBodySchema,
} from './schemas'

export const analysisRequestsRoutes = Router()

analysisRequestsRoutes.post(
  '/',
  requireAuth,
  validate({ body: CreateAnalysisRequestBodySchema }),
  asyncHandler(createAnalysisRequestHandler),
)

analysisRequestsRoutes.get(
  '/me',
  requireAuth,
  asyncHandler(listMyAnalysisRequestsHandler),
)

analysisRequestsRoutes.get(
  '/',
  validate({ query: ListAnalysisRequestsQuerySchema }),
  asyncHandler(listAnalysisRequestsHandler),
)

analysisRequestsRoutes.patch(
  '/:id',
  requireAuth,
  requireTeamOrAdmin,
  validate({ params: AnalysisRequestParamsSchema, body: UpdateAnalysisRequestBodySchema }),
  asyncHandler(updateAnalysisRequestHandler),
)
