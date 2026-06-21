import type { Request, Response } from 'express'
import { authService } from '../auth.service'
import { ResendEmailOtpBodySchema } from '../schemas'

export async function resendEmailOtpHandler(req: Request, res: Response) {
  const body = ResendEmailOtpBodySchema.parse(req.body)
  const result = await authService.sendEmailVerificationOtp(body.email)
  res.json(result)
}
