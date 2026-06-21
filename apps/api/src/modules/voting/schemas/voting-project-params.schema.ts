import { z } from '../../../core/openapi/zod'

export const VotingProjectParamsSchema = z.object({
  id: z.uuid(),
})
