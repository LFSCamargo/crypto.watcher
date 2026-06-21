import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { usersService } from '../users.service'
import { UpdateMeBodySchema } from '../schemas'

export async function updateMeHandler(req: Request, res: Response) {
  const body = UpdateMeBodySchema.parse(req.body)
  const user = await usersService.updateMe(res.locals.user.id, body)
  if (!user) throw new HttpError(404, 'User not found')
  res.json(user)
}
