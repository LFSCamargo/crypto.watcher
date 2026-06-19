import { Router } from 'express'
import { asyncHandler, HttpError, validate } from '../../core/http/validation'
import {
  GovernanceProposalParamsSchema,
  ListGovernanceProposalsQuerySchema,
} from './governance.schema'
import { governanceService } from './governance.service'

export const governanceRoutes = Router()

governanceRoutes.get(
  '/proposals',
  validate({ query: ListGovernanceProposalsQuerySchema }),
  asyncHandler(async (req, res) => {
    const query = ListGovernanceProposalsQuerySchema.parse(req.query)
    res.json(await governanceService.list(query))
  }),
)

governanceRoutes.get(
  '/proposals/:onchainId',
  validate({ params: GovernanceProposalParamsSchema }),
  asyncHandler(async (req, res) => {
    const params = GovernanceProposalParamsSchema.parse(req.params)
    const proposal = await governanceService.getByOnchainId(params.onchainId)
    if (!proposal) throw new HttpError(404, 'Governance proposal not found')
    res.json(proposal)
  }),
)
