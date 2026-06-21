import { z } from '../../../core/openapi/zod'
import { GovernanceProposalStateSchema } from './governance-proposal-state.schema'

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
