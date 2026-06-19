import type { Request, RequestHandler } from 'express'
import { HttpError } from '../http/validation'
import { authService, sessionCookieName } from '../../modules/auth/auth.service'

const parseCookies = (header: string | undefined): Record<string, string> =>
  Object.fromEntries(
    (header ?? '')
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [key, ...value] = part.split('=')
        return [key, decodeURIComponent(value.join('='))]
      }),
  )

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
