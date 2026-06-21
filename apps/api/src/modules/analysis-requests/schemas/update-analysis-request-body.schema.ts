import { z } from '../../../core/openapi/zod'
import { AnalysisRequestStatusSchema } from './analysis-request-status.schema'

export const UpdateAnalysisRequestBodySchema = z
  .object({
    status: AnalysisRequestStatusSchema.optional(),
    reviewNotes: z.string().max(5000).optional(),
    paymentTxHash: z.string().min(1).optional(),
  })
  .openapi('UpdateAnalysisRequestBody')
