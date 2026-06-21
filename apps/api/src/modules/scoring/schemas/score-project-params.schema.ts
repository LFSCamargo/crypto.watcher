import { z } from '../../../core/openapi/zod'

export const ScoreProjectParamsSchema = z.object({
  id: z.uuid(),
})
