import { Router } from 'express'
import { requireAuth } from '../../core/auth/session'
import { asyncHandler, validate } from '../../core/http/validation'
import {
  createNonceHandler,
  forgotPasswordHandler,
  forgotPasswordOtpHandler,
  getMeHandler,
  linkPublicKeyHandler,
  loginHandler,
  logoutHandler,
  registerHandler,
  resetPasswordHandler,
  resetPasswordOtpHandler,
  resendEmailOtpHandler,
  verifyHandler,
  verifyEmailOtpHandler,
} from './handlers'
import {
  ForgotPasswordBodySchema,
  LinkPublicKeyBodySchema,
  LoginBodySchema,
  NonceBodySchema,
  RegisterBodySchema,
  ResetPasswordBodySchema,
  ResetPasswordOtpBodySchema,
  ResendEmailOtpBodySchema,
  VerifyBodySchema,
  VerifyEmailOtpBodySchema,
} from './schemas'

export const authRoutes = Router()

authRoutes.post(
  '/nonce',
  validate({ body: NonceBodySchema }),
  asyncHandler(createNonceHandler),
)

authRoutes.post(
  '/verify',
  validate({ body: VerifyBodySchema }),
  asyncHandler(verifyHandler),
)

authRoutes.post(
  '/register',
  validate({ body: RegisterBodySchema }),
  asyncHandler(registerHandler),
)

authRoutes.post(
  '/login',
  validate({ body: LoginBodySchema }),
  asyncHandler(loginHandler),
)

authRoutes.post(
  '/link-public-key',
  requireAuth,
  validate({ body: LinkPublicKeyBodySchema }),
  asyncHandler(linkPublicKeyHandler),
)

authRoutes.post(
  '/forgot-password',
  validate({ body: ForgotPasswordBodySchema }),
  asyncHandler(forgotPasswordHandler),
)

authRoutes.post(
  '/forgot-password-otp',
  validate({ body: ForgotPasswordBodySchema }),
  asyncHandler(forgotPasswordOtpHandler),
)

authRoutes.post(
  '/reset-password',
  validate({ body: ResetPasswordBodySchema }),
  asyncHandler(resetPasswordHandler),
)

authRoutes.post(
  '/reset-password-otp',
  validate({ body: ResetPasswordOtpBodySchema }),
  asyncHandler(resetPasswordOtpHandler),
)

authRoutes.post(
  '/verify-email-otp',
  validate({ body: VerifyEmailOtpBodySchema }),
  asyncHandler(verifyEmailOtpHandler),
)

authRoutes.post(
  '/resend-email-otp',
  validate({ body: ResendEmailOtpBodySchema }),
  asyncHandler(resendEmailOtpHandler),
)

authRoutes.post('/logout', requireAuth, asyncHandler(logoutHandler))

authRoutes.get('/me', requireAuth, getMeHandler)
