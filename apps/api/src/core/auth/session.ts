import type { Request, RequestHandler } from 'express'
import { HttpError } from '../http/validation'
import { authService, sessionCookieName } from '../../modules/auth/auth.service'

const parseCookies = (header: string | undefined): Record<string, string> => {
  const cookies: Record<string, string> = {}
  if (!header) return cookies

  for (const part of header.split(';')) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const separator = trimmed.indexOf('=')
    if (separator === -1) continue

    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1)
    cookies[key] = decodeURIComponent(value)
  }

  return cookies
}

export const getSessionId = (req: Request): string | undefined =>
  parseCookies(req.headers.cookie)[sessionCookieName]

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const sessionId = getSessionId(req)
    if (!sessionId) throw new HttpError(401, 'Authentication required')

    const session = await authService.getSession(sessionId)
    if (!session) throw new HttpError(401, 'Authentication required')

    res.locals.user = session.user
    res.locals.sessionId = session.sessionId
    next()
  } catch (error) {
    next(error)
  }
}

export const requireTeamOrAdmin: RequestHandler = (req, res, next) => {
  void req
  const role = res.locals.user?.role
  if (role !== 'team' && role !== 'admin') {
    next(new HttpError(403, 'Team or admin role required'))
    return
  }
  next()
}
