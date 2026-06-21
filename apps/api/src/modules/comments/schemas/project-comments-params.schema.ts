import { z } from '../../../core/openapi/zod'

export const ProjectCommentsParamsSchema = z.object({
  id: z.uuid(),
})
