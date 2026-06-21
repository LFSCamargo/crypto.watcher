import { z } from '../../../core/openapi/zod'

export const UserIdentifierParamsSchema = z.object({
  identifier: z.string().min(1),
})
