import { z } from '../../../core/openapi/zod'
import { ProjectStateSchema } from './project-state.schema'

export const ProjectSchema = z
  .object({
    id: z.uuid(),
    slug: z.string(),
    name: z.string().min(1).max(120),
    description: z.string().nullable().optional(),
    chainId: z.number().int(),
    tokenAddress: z.string().nullable().optional(),
    state: ProjectStateSchema,
    votingContractAddress: z.string().nullable().optional(),
    createdAt: z.iso.datetime(),
  })
  .openapi('Project')
