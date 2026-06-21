import { z } from '../../../core/openapi/zod'

export const PricePointSchema = z
  .object({
    timestamp: z.number().int(),
    price: z.number(),
  })
  .openapi('PricePoint')
