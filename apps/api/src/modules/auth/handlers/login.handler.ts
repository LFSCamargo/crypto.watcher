import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { authService } from '../auth.service'
import { LoginBodySchema } from '../schemas'

export async function loginHandler(req: Request, res: Response) {
  const body = LoginBodySchema.parse(req.body)
  const result = await authService.login(body)
  if (!result) throw new HttpError(401, 'Invalid email or password')

  res.json(result)
}
