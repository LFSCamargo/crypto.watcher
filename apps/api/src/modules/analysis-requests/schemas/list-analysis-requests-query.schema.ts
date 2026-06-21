import { z } from '../../../core/openapi/zod'
import { AnalysisRequestStatusSchema } from './analysis-request-status.schema'

export const ListAnalysisRequestsQuerySchema = z
  .object({
    status: AnalysisRequestStatusSchema.optional(),
  })
  .openapi('ListAnalysisRequestsQuery')
