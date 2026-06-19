import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export const ScoreSchema = z
  .object({
    projectId: z.uuid(),
    round: z.number().int(),
    value: z.string(),
    breakdown: z.object({
      weightFor: z.string(),
      weightAgainst: z.string(),
      totalWeight: z.string(),
    }),
  })
  .openapi('Score')

export const ScoreProjectParamsSchema = z.object({
  id: z.uuid(),
})
