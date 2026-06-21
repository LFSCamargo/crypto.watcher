import { z } from '../../../core/openapi/zod'

export const ReputationParamsSchema = z.object({
  address: z.string().min(1),
})
