import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { usersService } from '../users.service'
import type { UpdateMeBodySchema } from '../schemas'
import type { z } from '../../../core/openapi/zod'

type UpdateMeBody = z.infer<typeof UpdateMeBodySchema>

export async function updateMeHandler(req: Request, res: Response) {
  const body = req.body as UpdateMeBody
  const user = await usersService.updateMe(res.locals.user.id, body)
  if (!user) throw new HttpError(404, 'User not found')
  res.json(user)
}
