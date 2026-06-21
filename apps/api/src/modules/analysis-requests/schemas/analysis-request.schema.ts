import { z } from '../../../core/openapi/zod'
import { AnalysisRequestStatusSchema } from './analysis-request-status.schema'

export const AnalysisRequestSchema = z
  .object({
    id: z.uuid(),
    userId: z.uuid(),
    projectName: z.string(),
    projectUrl: z.string(),
    description: z.string(),
    status: AnalysisRequestStatusSchema,
    paymentTxHash: z.string().nullable(),
    feeAmount: z.string(),
    reviewNotes: z.string().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime().nullable(),
  })
  .openapi('AnalysisRequest')
