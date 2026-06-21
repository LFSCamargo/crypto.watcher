import { z } from '../../../core/openapi/zod'

export const ProjectIdParamsSchema = z.object({
  id: z.uuid(),
})
