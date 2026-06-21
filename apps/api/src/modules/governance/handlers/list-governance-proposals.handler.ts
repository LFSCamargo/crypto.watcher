import type { Request, Response } from 'express'
import { governanceService } from '../governance.service'
import { ListGovernanceProposalsQuerySchema } from '../schemas'

export async function listGovernanceProposalsHandler(req: Request, res: Response) {
  const query = ListGovernanceProposalsQuerySchema.parse(req.query)
  res.json(await governanceService.list(query))
}
