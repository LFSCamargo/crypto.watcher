import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export const VoteChoiceSchema = z.union([z.literal(0), z.literal(1)])

export const VoteTallySchema = z
  .object({
    projectId: z.uuid(),
    round: z.number().int(),
    weightFor: z.string(),
    weightAgainst: z.string(),
  })
  .openapi('VoteTally')

export const VoteEligibilitySchema = z
  .object({
    address: z.string(),
    eligible: z.boolean(),
    weight: z.string(),
  })
  .openapi('VoteEligibility')

export const VotingProjectParamsSchema = z.object({
  id: z.uuid(),
})

export const VoteEligibilityQuerySchema = z.object({
  address: z.string().min(1),
})
