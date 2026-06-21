import { z } from '../../../core/openapi/zod'
import { PricePointSchema } from './price-point.schema'

export const MarketSnapshotSchema = z
  .object({
    slug: z.string(),
    coingeckoId: z.string(),
    currency: z.literal('usd'),
    price: z.number(),
    change24h: z.number().nullable(),
    change7d: z.number().nullable(),
    change1m: z.number().nullable(),
    change1y: z.number().nullable(),
    history: z.array(PricePointSchema),
    cachedAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
    stale: z.boolean().optional(),
  })
  .openapi('MarketSnapshot')
