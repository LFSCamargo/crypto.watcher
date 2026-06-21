import { z } from '../../../core/openapi/zod'

export const VoteEligibilityQuerySchema = z.object({
  address: z.string().min(1),
})
