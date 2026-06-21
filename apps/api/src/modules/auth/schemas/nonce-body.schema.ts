import { z } from '../../../core/openapi/zod'

export const NonceBodySchema = z
  .object({
    address: z.string().min(1),
  })
  .openapi('NonceBody')
