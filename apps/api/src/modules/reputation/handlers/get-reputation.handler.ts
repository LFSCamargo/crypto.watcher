import type { Request, Response } from 'express'
import { reputationService } from '../reputation.service'
import { ReputationParamsSchema } from '../schemas'

export async function getReputationHandler(req: Request, res: Response) {
  const params = ReputationParamsSchema.parse(req.params)
  res.json(await reputationService.getByAddress(params.address))
}
