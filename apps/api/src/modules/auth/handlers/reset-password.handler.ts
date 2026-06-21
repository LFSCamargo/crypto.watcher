import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { authService } from '../auth.service'
import { ResetPasswordBodySchema } from '../schemas'

export async function resetPasswordHandler(req: Request, res: Response) {
  const body = ResetPasswordBodySchema.parse(req.body)
  const result = await authService.resetPassword(body)
  if (!result) throw new HttpError(400, 'Invalid or expired reset token')
  res.json(result)
}
