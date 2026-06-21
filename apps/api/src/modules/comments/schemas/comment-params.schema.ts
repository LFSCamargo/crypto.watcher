import { z } from '../../../core/openapi/zod'

export const CommentParamsSchema = z.object({
  id: z.uuid(),
})
