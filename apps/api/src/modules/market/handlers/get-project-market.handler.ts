import type { Request, Response } from 'express'
import { MARKET_CACHE_TTL_MS } from '../market.cache'
import { marketService } from '../market.service'
import { MarketProjectParamsSchema } from '../schemas'

export async function getProjectMarketHandler(req: Request, res: Response) {
  const params = MarketProjectParamsSchema.parse(req.params)
  const snapshot = await marketService.getProjectMarket(params.slug)

  res.set('Cache-Control', `public, max-age=${Math.floor(MARKET_CACHE_TTL_MS / 1000)}`)
  res.json(snapshot)
}
