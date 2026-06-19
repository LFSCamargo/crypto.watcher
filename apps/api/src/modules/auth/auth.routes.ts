import { Router } from 'express'
import { requireAuth } from '../../core/auth/session'
import { asyncHandler, HttpError, validate } from '../../core/http/validation'
import { authService, sessionCookieName } from './auth.service'
import { NonceBodySchema, VerifyBodySchema } from './auth.schema'

export const authRoutes = Router()

authRoutes.post(
  '/nonce',
  validate({ body: NonceBodySchema }),
  asyncHandler(async (req, res) => {
    const body = NonceBodySchema.parse(req.body)
    res.json(await authService.createNonce(body.address))
  }),
)

authRoutes.post(
  '/verify',
  validate({ body: VerifyBodySchema }),
  asyncHandler(async (req, res) => {
    const body = VerifyBodySchema.parse(req.body)
    const session = await authService.verify(body)
    if (!session) throw new HttpError(401, 'Invalid signature')

    res.cookie(sessionCookieName, session.sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    res.json({ user: session.user })
  }),
)

authRoutes.post(
  '/logout',
  requireAuth,
  asyncHandler(async (_req, res) => {
    await authService.revokeSession(res.locals.sessionId)
    res.clearCookie(sessionCookieName)
    res.status(204).send()
  }),
)

authRoutes.get('/me', requireAuth, (_req, res) => {
  res.json({ user: res.locals.user })
})
