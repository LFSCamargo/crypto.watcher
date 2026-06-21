import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export const MarketProjectParamsSchema = z.object({
  slug: z.string().min(1),
})

export const PricePointSchema = z
  .object({
    timestamp: z.number().int(),
    price: z.number(),
  })
  .openapi('PricePoint')

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
