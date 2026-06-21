import { z } from '../../../core/openapi/zod'

export const ResetPasswordOtpBodySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
  password: z.string().min(8),
})
