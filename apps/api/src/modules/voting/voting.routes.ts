import { Router } from 'express'
import { asyncHandler, validate } from '../../core/http/validation'
import { VoteEligibilityQuerySchema, VotingProjectParamsSchema } from './voting.schema'
import { votingService } from './voting.service'

export const votingRoutes = Router()

votingRoutes.get(
  '/projects/:id/votes',
  validate({ params: VotingProjectParamsSchema }),
  asyncHandler(async (req, res) => {
    const params = VotingProjectParamsSchema.parse(req.params)
    res.json(await votingService.getTally(params.id))
  }),
)

votingRoutes.get(
  '/projects/:id/votes/eligibility',
  validate({ params: VotingProjectParamsSchema, query: VoteEligibilityQuerySchema }),
  asyncHandler(async (req, res) => {
    const query = VoteEligibilityQuerySchema.parse(req.query)
    res.json(await votingService.getEligibility(query.address))
  }),
)
