import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { authService } from '../auth.service'
import { VerifyEmailOtpBodySchema } from '../schemas'

export async function verifyEmailOtpHandler(req: Request, res: Response) {
  const body = VerifyEmailOtpBodySchema.parse(req.body)
  const result = await authService.verifyEmailOtp(body)
  if (!result) throw new HttpError(400, 'Invalid or expired verification code')
  res.json(result)
}
