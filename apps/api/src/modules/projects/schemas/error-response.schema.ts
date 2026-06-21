import { z } from '../../../core/openapi/zod'

export const ErrorResponseSchema = z
  .object({
    message: z.string(),
  })
  .openapi('ErrorResponse')
