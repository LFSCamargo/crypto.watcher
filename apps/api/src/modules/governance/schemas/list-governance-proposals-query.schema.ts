import { z } from '../../../core/openapi/zod'
import { GovernanceProposalStateSchema } from './governance-proposal-state.schema'

export const ListGovernanceProposalsQuerySchema = z.object({
  state: GovernanceProposalStateSchema.optional(),
})
