import { z } from '../../../core/openapi/zod'

export const VoteTallySchema = z
  .object({
    projectId: z.uuid(),
    round: z.number().int(),
    weightFor: z.string(),
    weightAgainst: z.string(),
  })
  .openapi('VoteTally')
