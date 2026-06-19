import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export const ReputationSchema = z
  .object({
    walletAddress: z.string(),
    eligible: z.boolean(),
    weight: z.string(),
    factors: z.record(z.string(), z.unknown()).nullable(),
  })
  .openapi('Reputation')

export const ReputationParamsSchema = z.object({
  address: z.string().min(1),
})
