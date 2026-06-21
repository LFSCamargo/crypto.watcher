import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { authService } from '../auth.service'
import { VerifyBodySchema } from '../schemas'
import { setSessionCookie } from './set-session-cookie'

export async function verifyHandler(req: Request, res: Response) {
  const body = VerifyBodySchema.parse(req.body)
  const session = await authService.verify(body)
  if (!session) throw new HttpError(401, 'Invalid signature')

  setSessionCookie(res, session.sessionId)
  res.json({ user: session.user })
}
