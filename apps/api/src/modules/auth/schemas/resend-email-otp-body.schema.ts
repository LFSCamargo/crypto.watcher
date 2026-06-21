import { z } from '../../../core/openapi/zod'

export const ResendEmailOtpBodySchema = z.object({
  email: z.string().email(),
})
