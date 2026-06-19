import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export const CommentSchema = z
  .object({
    id: z.uuid(),
    projectId: z.uuid(),
    authorId: z.uuid(),
    body: z.string(),
    createdAt: z.iso.datetime(),
  })
  .openapi('Comment')

export const ProjectCommentsParamsSchema = z.object({
  id: z.uuid(),
})

export const CommentParamsSchema = z.object({
  id: z.uuid(),
})

export const CreateCommentBodySchema = z
  .object({
    body: z.string().min(1).max(5000),
  })
  .openapi('CreateCommentBody')
