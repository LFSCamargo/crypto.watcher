import type { Request, Response } from 'express'
import { commentsService } from '../comments.service'
import { ProjectCommentsParamsSchema } from '../schemas'

export async function listProjectCommentsHandler(req: Request, res: Response) {
  const params = ProjectCommentsParamsSchema.parse(req.params)
  res.json(await commentsService.listByProject(params.id))
}
