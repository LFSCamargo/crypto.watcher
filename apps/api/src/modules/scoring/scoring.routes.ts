import { Router } from 'express'
import { asyncHandler, validate } from '../../core/http/validation'
import { getCurrentScoreHandler, getScoreHistoryHandler } from './handlers'
import { ScoreProjectParamsSchema } from './schemas'

export const scoringRoutes = Router()

scoringRoutes.get(
  '/projects/:id/score',
  validate({ params: ScoreProjectParamsSchema }),
  asyncHandler(getCurrentScoreHandler),
)

scoringRoutes.get(
  '/projects/:id/score/history',
  validate({ params: ScoreProjectParamsSchema }),
  asyncHandler(getScoreHistoryHandler),
)
