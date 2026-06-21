import type { Request, Response } from 'express'
import { commentsService } from '../comments.service'
import { CreateCommentBodySchema, ProjectCommentsParamsSchema } from '../schemas'

export async function createCommentHandler(req: Request, res: Response) {
  const params = ProjectCommentsParamsSchema.parse(req.params)
  const body = CreateCommentBodySchema.parse(req.body)
  const comment = await commentsService.create({
    projectId: params.id,
    authorId: res.locals.user.id,
    body: body.body,
  })
  res.status(201).json(comment)
}
