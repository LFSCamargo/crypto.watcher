import { z } from '../../../core/openapi/zod'

export const ResetPasswordBodySchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8).max(128),
  })
  .openapi('ResetPasswordBody')
