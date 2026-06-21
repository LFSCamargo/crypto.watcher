import { z } from '../../../core/openapi/zod'
import { AnalysisRequestSchema } from './analysis-request.schema'

export const AnalysisRequestListSchema = z
  .object({
    items: z.array(AnalysisRequestSchema),
  })
  .openapi('AnalysisRequestList')
