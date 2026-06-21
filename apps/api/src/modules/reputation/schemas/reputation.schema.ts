import { z } from '../../../core/openapi/zod'

export const ReputationSchema = z
  .object({
    walletAddress: z.string(),
    eligible: z.boolean(),
    weight: z.string(),
    factors: z.record(z.string(), z.unknown()).nullable(),
  })
  .openapi('Reputation')
