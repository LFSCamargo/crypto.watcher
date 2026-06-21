import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { commentsService } from '../comments.service'
import { CommentParamsSchema } from '../schemas'

export async function deleteCommentHandler(req: Request, res: Response) {
  const params = CommentParamsSchema.parse(req.params)
  const result = await commentsService.softDelete(params.id, res.locals.user.id)
  if (result === 'not_found') throw new HttpError(404, 'Comment not found')
  if (result === 'forbidden')
    throw new HttpError(403, 'Only the author can delete this comment')
  res.status(204).send()
}
