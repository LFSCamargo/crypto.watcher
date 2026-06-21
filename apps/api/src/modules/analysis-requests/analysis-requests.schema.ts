import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export const AnalysisRequestStatusSchema = z.enum([
  'pending',
  'paid',
  'in_review',
  'approved',
  'rejected',
])

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

export const CreateAnalysisRequestBodySchema = z
  .object({
    projectName: z.string().min(1).max(200),
    projectUrl: z.string().url(),
    description: z.string().min(10).max(5000),
  })
  .openapi('CreateAnalysisRequestBody')

export const ListAnalysisRequestsQuerySchema = z
  .object({
    status: AnalysisRequestStatusSchema.optional(),
  })
  .openapi('ListAnalysisRequestsQuery')

export const AnalysisRequestParamsSchema = z
  .object({
    id: z.uuid(),
  })
  .openapi('AnalysisRequestParams')

export const UpdateAnalysisRequestBodySchema = z
  .object({
    status: AnalysisRequestStatusSchema.optional(),
    reviewNotes: z.string().max(5000).optional(),
    paymentTxHash: z.string().min(1).optional(),
  })
  .openapi('UpdateAnalysisRequestBody')

export const AnalysisRequestListSchema = z
  .object({
    items: z.array(AnalysisRequestSchema),
  })
  .openapi('AnalysisRequestList')
