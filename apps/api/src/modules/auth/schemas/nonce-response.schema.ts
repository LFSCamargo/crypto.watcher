import { z } from '../../../core/openapi/zod'

export const NonceResponseSchema = z
  .object({
    nonce: z.string(),
    message: z.string(),
  })
  .openapi('NonceResponse')
