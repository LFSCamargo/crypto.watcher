import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { scoringService } from '../scoring.service'
import { ScoreProjectParamsSchema } from '../schemas'

export async function getCurrentScoreHandler(req: Request, res: Response) {
  const params = ScoreProjectParamsSchema.parse(req.params)
  const score = await scoringService.getCurrent(params.id)
  if (!score) throw new HttpError(404, 'Score not found')
  res.json(score)
}
