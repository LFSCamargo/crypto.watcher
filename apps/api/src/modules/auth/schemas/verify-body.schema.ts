import { z } from '../../../core/openapi/zod'

export const VerifyBodySchema = z
  .object({
    address: z.string().min(1),
    message: z.string().min(1),
    signature: z.string().min(1),
  })
  .openapi('VerifyBody')
