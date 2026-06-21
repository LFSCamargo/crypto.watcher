import { Router } from 'express'
import { asyncHandler, validate } from '../../core/http/validation'
import { getGovernanceProposalHandler, listGovernanceProposalsHandler } from './handlers'
import {
  GovernanceProposalParamsSchema,
  ListGovernanceProposalsQuerySchema,
} from './schemas'

export const governanceRoutes = Router()

governanceRoutes.get(
  '/proposals',
  validate({ query: ListGovernanceProposalsQuerySchema }),
  asyncHandler(listGovernanceProposalsHandler),
)

governanceRoutes.get(
  '/proposals/:onchainId',
  validate({ params: GovernanceProposalParamsSchema }),
  asyncHandler(getGovernanceProposalHandler),
)
