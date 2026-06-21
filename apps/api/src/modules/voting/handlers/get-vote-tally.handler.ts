import type { Request, Response } from 'express'
import { votingService } from '../voting.service'
import { VotingProjectParamsSchema } from '../schemas'

export async function getVoteTallyHandler(req: Request, res: Response) {
  const params = VotingProjectParamsSchema.parse(req.params)
  res.json(await votingService.getTally(params.id))
}
