import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { authService } from '../auth.service'
import { LoginBodySchema } from '../schemas'
import { setSessionCookie } from './set-session-cookie'

export async function loginHandler(req: Request, res: Response) {
  const body = LoginBodySchema.parse(req.body)
  const session = await authService.login(body)
  if (!session) throw new HttpError(401, 'Invalid email or password')

  setSessionCookie(res, session.sessionId)
  res.json({ user: session.user })
}
