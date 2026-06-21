import { z } from '../../../core/openapi/zod'

export const AnalysisRequestStatusSchema = z.enum([
  'pending',
  'paid',
  'in_review',
  'approved',
  'rejected',
])
