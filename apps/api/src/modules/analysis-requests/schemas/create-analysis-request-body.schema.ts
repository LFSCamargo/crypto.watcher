import { z } from '../../../core/openapi/zod'

export const CreateAnalysisRequestBodySchema = z
  .object({
    projectName: z.string().min(1).max(200),
    projectUrl: z.string().url(),
    description: z.string().min(10).max(5000),
  })
  .openapi('CreateAnalysisRequestBody')
