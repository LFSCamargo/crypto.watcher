import { z } from '../../../core/openapi/zod'

export const LinkPublicKeyBodySchema = z
  .object({
    publicKey: z.string().min(1),
  })
  .openapi('LinkPublicKeyBody')
