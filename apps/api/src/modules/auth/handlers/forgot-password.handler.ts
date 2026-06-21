import type { Request, Response } from 'express'
import { authService } from '../auth.service'
import { ForgotPasswordBodySchema } from '../schemas'

export async function forgotPasswordHandler(req: Request, res: Response) {
  const body = ForgotPasswordBodySchema.parse(req.body)
  const result = await authService.requestPasswordReset(body.email)
  res.json(result)
}
