import { z } from '../../../core/openapi/zod'

export const ProjectParamsSchema = z.object({
  slug: z.string().min(1),
})
