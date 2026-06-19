import { Router } from 'express'
import { asyncHandler, HttpError, validate } from '../../core/http/validation'
import { ScoreProjectParamsSchema } from './scoring.schema'
import { scoringService } from './scoring.service'

export const scoringRoutes = Router()

scoringRoutes.get(
  '/projects/:id/score',
  validate({ params: ScoreProjectParamsSchema }),
  asyncHandler(async (req, res) => {
    const params = ScoreProjectParamsSchema.parse(req.params)
    const score = await scoringService.getCurrent(params.id)
    if (!score) throw new HttpError(404, 'Score not found')
    res.json(score)
  }),
)

scoringRoutes.get(
  '/projects/:id/score/history',
  validate({ params: ScoreProjectParamsSchema }),
  asyncHandler(async (req, res) => {
    const params = ScoreProjectParamsSchema.parse(req.params)
    res.json(await scoringService.getHistory(params.id))
  }),
)
