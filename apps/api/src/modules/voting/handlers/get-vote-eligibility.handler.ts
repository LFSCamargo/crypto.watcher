import type { Request, Response } from 'express'
import { votingService } from '../voting.service'
import { VoteEligibilityQuerySchema } from '../schemas'

export async function getVoteEligibilityHandler(req: Request, res: Response) {
  const query = VoteEligibilityQuerySchema.parse(req.query)
  res.json(await votingService.getEligibility(query.address))
}
