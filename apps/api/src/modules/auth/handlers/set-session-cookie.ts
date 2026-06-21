import type { Response } from 'express'
import { sessionCookieName } from '../auth.service'

export const setSessionCookie = (res: Response, sessionId: string) => {
  res.cookie(sessionCookieName, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}
