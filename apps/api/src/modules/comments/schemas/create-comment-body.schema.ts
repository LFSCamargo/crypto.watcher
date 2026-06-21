import { z } from '../../../core/openapi/zod'

export const CreateCommentBodySchema = z
  .object({
    body: z.string().min(1).max(5000),
  })
  .openapi('CreateCommentBody')
