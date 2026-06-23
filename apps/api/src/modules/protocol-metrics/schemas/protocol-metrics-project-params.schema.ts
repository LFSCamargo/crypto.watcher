import { z } from '../../../core/openapi/zod'

export const ProtocolMetricsProjectParamsSchema = z
  .object({
    slug: z.string().min(1),
  })
  .openapi('ProtocolMetricsProjectParams')
