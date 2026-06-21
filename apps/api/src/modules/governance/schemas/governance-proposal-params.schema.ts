import { z } from '../../../core/openapi/zod'

export const GovernanceProposalParamsSchema = z.object({
  onchainId: z.string().min(1),
})
