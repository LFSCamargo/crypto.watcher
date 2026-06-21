import { z } from '../../../core/openapi/zod'
import { ProjectStateSchema } from './project-state.schema'

export const TransitionProjectBodySchema = z
  .object({
    state: ProjectStateSchema,
    votingContractAddress: z.string().optional(),
  })
  .openapi('TransitionProjectBody')
