import { z } from '../../../core/openapi/zod'

export const GovernanceProposalStateSchema = z.enum([
  'pending',
  'active',
  'succeeded',
  'defeated',
  'executed',
])
