import { z } from '../../../core/openapi/zod'

export const ForgotPasswordBodySchema = z
  .object({
    email: z.email(),
  })
  .openapi('ForgotPasswordBody')
