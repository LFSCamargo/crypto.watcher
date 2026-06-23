import { z } from '../../../core/openapi/zod'

export const CreditRatingGroupSchema = z.enum(['investment_grade', 'speculative_grade'])

export const CreditRatingSchema = z
  .object({
    sp: z.enum(['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C', 'D']),
    moodys: z.enum(['Aaa', 'Aa', 'A', 'Baa', 'Ba', 'B', 'Caa', 'Ca', 'C', 'D']),
    group: CreditRatingGroupSchema,
  })
  .openapi('CreditRating')

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
    creditRating: CreditRatingSchema,
  })
  .openapi('Score')
