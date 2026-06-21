import { z } from '../../../core/openapi/zod'

export const AnalysisRequestParamsSchema = z
  .object({
    id: z.uuid(),
  })
  .openapi('AnalysisRequestParams')
