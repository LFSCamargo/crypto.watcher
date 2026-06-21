import type { Request, Response } from 'express'
import { scoringService } from '../scoring.service'
import { ScoreProjectParamsSchema } from '../schemas'

export async function getScoreHistoryHandler(req: Request, res: Response) {
  const params = ScoreProjectParamsSchema.parse(req.params)
  res.json(await scoringService.getHistory(params.id))
}
