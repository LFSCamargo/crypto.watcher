import type { Request, Response } from 'express'
import { authService, sessionCookieName } from '../auth.service'

export async function logoutHandler(_req: Request, res: Response) {
  await authService.revokeSession(res.locals.sessionId)
  res.clearCookie(sessionCookieName)
  res.status(204).send()
}
