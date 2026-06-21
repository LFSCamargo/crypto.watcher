import { z } from '../../../core/openapi/zod'

export const VerifyEmailOtpBodySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
})
