import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { usersService } from '../users.service'

export async function getMeHandler(_req: Request, res: Response) {
  const user = await usersService.getById(res.locals.user.id)
  if (!user) throw new HttpError(404, 'User not found')
  res.json(user)
}
