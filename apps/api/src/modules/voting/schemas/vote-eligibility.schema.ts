import { z } from '../../../core/openapi/zod'

export const VoteEligibilitySchema = z
  .object({
    address: z.string(),
    eligible: z.boolean(),
    weight: z.string(),
  })
  .openapi('VoteEligibility')
