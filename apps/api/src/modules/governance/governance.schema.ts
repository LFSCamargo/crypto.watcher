import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export const GovernanceProposalStateSchema = z.enum([
  'pending',
  'active',
  'succeeded',
  'defeated',
  'executed',
])

export const GovernanceProposalSchema = z
  .object({
    id: z.uuid(),
    onchainId: z.string(),
    proposerAddress: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    state: GovernanceProposalStateSchema,
    startBlock: z.string().nullable(),
    endBlock: z.string().nullable(),
  })
  .openapi('GovernanceProposal')

export const GovernanceProposalParamsSchema = z.object({
  onchainId: z.string().min(1),
})

export const ListGovernanceProposalsQuerySchema = z.object({
  state: GovernanceProposalStateSchema.optional(),
})
