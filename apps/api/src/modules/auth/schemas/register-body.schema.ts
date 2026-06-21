import { z } from '../../../core/openapi/zod'

export const RegisterBodySchema = z
  .object({
    email: z.email(),
    password: z.string().min(8).max(128),
    nickname: z.string().min(2).max(32).optional(),
  })
  .openapi('RegisterBody')
