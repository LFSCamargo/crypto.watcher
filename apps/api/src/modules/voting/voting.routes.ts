import { Router } from 'express'
import { asyncHandler, validate } from '../../core/http/validation'
import { getVoteEligibilityHandler, getVoteTallyHandler } from './handlers'
import { VoteEligibilityQuerySchema, VotingProjectParamsSchema } from './schemas'

export const votingRoutes = Router()

votingRoutes.get(
  '/projects/:id/votes',
  validate({ params: VotingProjectParamsSchema }),
  asyncHandler(getVoteTallyHandler),
)

votingRoutes.get(
  '/projects/:id/votes/eligibility',
  validate({ params: VotingProjectParamsSchema, query: VoteEligibilityQuerySchema }),
  asyncHandler(getVoteEligibilityHandler),
)
