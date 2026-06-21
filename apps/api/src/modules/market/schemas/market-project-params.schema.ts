import { z } from '../../../core/openapi/zod'

export const MarketProjectParamsSchema = z.object({
  slug: z.string().min(1),
})
