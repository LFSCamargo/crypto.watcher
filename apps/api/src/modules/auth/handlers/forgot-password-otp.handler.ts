import type { Request, Response } from 'express'
import { authService } from '../auth.service'
import { ForgotPasswordBodySchema } from '../schemas'

export async function forgotPasswordOtpHandler(req: Request, res: Response) {
  const body = ForgotPasswordBodySchema.parse(req.body)
  const result = await authService.sendPasswordResetOtp(body.email)
  res.json(result)
}
