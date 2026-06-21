import { Router } from 'express'
import { asyncHandler, validate } from '../../core/http/validation'
import { MARKET_CACHE_TTL_MS } from './market.cache'
import { MarketProjectParamsSchema } from './market.schema'
import { marketService } from './market.service'

export const marketRoutes = Router()

marketRoutes.get(
  '/projects/:slug',
  validate({ params: MarketProjectParamsSchema }),
  asyncHandler(async (req, res) => {
    const params = MarketProjectParamsSchema.parse(req.params)
    const snapshot = await marketService.getProjectMarket(params.slug)

    res.set('Cache-Control', `public, max-age=${Math.floor(MARKET_CACHE_TTL_MS / 1000)}`)
    res.json(snapshot)
  }),
)
