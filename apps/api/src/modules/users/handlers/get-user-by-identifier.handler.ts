import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { usersService } from '../users.service'
import { UserIdentifierParamsSchema } from '../schemas'

export async function getUserByIdentifierHandler(req: Request, res: Response) {
  const params = UserIdentifierParamsSchema.parse(req.params)
  const { identifier } = params

  const user = identifier.startsWith('0x')
    ? await usersService.getByAddress(identifier)
    : await usersService.getByNickname(identifier)

  if (!user) throw new HttpError(404, 'User not found')
  res.json(user)
}
