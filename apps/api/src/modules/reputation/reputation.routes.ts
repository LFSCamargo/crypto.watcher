import { Router } from 'express'
import { asyncHandler, validate } from '../../core/http/validation'
import { ReputationParamsSchema } from './reputation.schema'
import { reputationService } from './reputation.service'

export const reputationRoutes = Router()

reputationRoutes.get(
  '/:address',
  validate({ params: ReputationParamsSchema }),
  asyncHandler(async (req, res) => {
    const params = ReputationParamsSchema.parse(req.params)
    res.json(await reputationService.getByAddress(params.address))
  }),
)
