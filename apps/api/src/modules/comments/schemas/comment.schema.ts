import { z } from '../../../core/openapi/zod'

export const CommentSchema = z
  .object({
    id: z.uuid(),
    projectId: z.uuid(),
    authorId: z.uuid(),
    body: z.string(),
    createdAt: z.iso.datetime(),
  })
  .openapi('Comment')
