import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { authService } from '../auth.service'
import { ResetPasswordOtpBodySchema } from '../schemas'

export async function resetPasswordOtpHandler(req: Request, res: Response) {
  const body = ResetPasswordOtpBodySchema.parse(req.body)
  const result = await authService.resetPasswordWithOtp(body)
  if (!result) throw new HttpError(400, 'Invalid or expired reset code')
  res.json(result)
}
