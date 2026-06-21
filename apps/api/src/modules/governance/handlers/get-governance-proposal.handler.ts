import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { governanceService } from '../governance.service'
import { GovernanceProposalParamsSchema } from '../schemas'

export async function getGovernanceProposalHandler(req: Request, res: Response) {
  const params = GovernanceProposalParamsSchema.parse(req.params)
  const proposal = await governanceService.getByOnchainId(params.onchainId)
  if (!proposal) throw new HttpError(404, 'Governance proposal not found')
  res.json(proposal)
}
