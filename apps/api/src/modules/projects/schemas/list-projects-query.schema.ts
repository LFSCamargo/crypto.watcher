import { z } from '../../../core/openapi/zod'
import { ProjectStateSchema } from './project-state.schema'

export const ListProjectsQuerySchema = z.object({
  state: ProjectStateSchema.optional(),
  chainId: z.coerce.number().int().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
