import { z } from '../../../core/openapi/zod'

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
