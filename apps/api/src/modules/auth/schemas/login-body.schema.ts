import { z } from '../../../core/openapi/zod'

export const LoginBodySchema = z
  .object({
    email: z.email(),
    password: z.string().min(1).max(128),
  })
  .openapi('LoginBody')
