import { Router } from 'express'
import { requireAuth } from '../../core/auth/session'
import { asyncHandler, HttpError, validate } from '../../core/http/validation'
import { authService, sessionCookieName } from './auth.service'
import {
  ForgotPasswordBodySchema,
  LinkPublicKeyBodySchema,
  LoginBodySchema,
  NonceBodySchema,
  RegisterBodySchema,
  ResetPasswordBodySchema,
  VerifyBodySchema,
} from './auth.schema'

const setSessionCookie = (res: import('express').Response, sessionId: string) => {
  res.cookie(sessionCookieName, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

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

    setSessionCookie(res, session.sessionId)
    res.json({ user: session.user })
  }),
)

authRoutes.post(
  '/register',
  validate({ body: RegisterBodySchema }),
  asyncHandler(async (req, res) => {
    const body = RegisterBodySchema.parse(req.body)
    try {
      const session = await authService.register(body)
      setSessionCookie(res, session.sessionId)
      res.status(201).json({ user: session.user })
    } catch (error) {
      if (error instanceof Error && error.message === 'EMAIL_TAKEN') {
        throw new HttpError(409, 'Email already registered')
      }
      if (error instanceof Error && error.message === 'NICKNAME_TAKEN') {
        throw new HttpError(409, 'Nickname already taken')
      }
      throw error
    }
  }),
)

authRoutes.post(
  '/login',
  validate({ body: LoginBodySchema }),
  asyncHandler(async (req, res) => {
    const body = LoginBodySchema.parse(req.body)
    const session = await authService.login(body)
    if (!session) throw new HttpError(401, 'Invalid email or password')

    setSessionCookie(res, session.sessionId)
    res.json({ user: session.user })
  }),
)

authRoutes.post(
  '/link-public-key',
  requireAuth,
  validate({ body: LinkPublicKeyBodySchema }),
  asyncHandler(async (req, res) => {
    const body = LinkPublicKeyBodySchema.parse(req.body)
    try {
      const user = await authService.linkPublicKey(res.locals.user.id, body.publicKey)
      res.json({ user })
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_PUBLIC_KEY') {
        throw new HttpError(400, 'Invalid wallet address format')
      }
      if (error instanceof Error && error.message === 'WALLET_TAKEN') {
        throw new HttpError(409, 'Wallet already linked to another account')
      }
      throw error
    }
  }),
)

authRoutes.post(
  '/forgot-password',
  validate({ body: ForgotPasswordBodySchema }),
  asyncHandler(async (req, res) => {
    const body = ForgotPasswordBodySchema.parse(req.body)
    const result = await authService.requestPasswordReset(body.email)
    res.json(result)
  }),
)

authRoutes.post(
  '/reset-password',
  validate({ body: ResetPasswordBodySchema }),
  asyncHandler(async (req, res) => {
    const body = ResetPasswordBodySchema.parse(req.body)
    const result = await authService.resetPassword(body)
    if (!result) throw new HttpError(400, 'Invalid or expired reset token')
    res.json(result)
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
