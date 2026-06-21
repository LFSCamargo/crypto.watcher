import { z } from '../../../core/openapi/zod'

export const CreateProjectBodySchema = z
  .object({
    name: z.string().min(1).max(120),
    description: z.string().optional(),
    chainId: z.number().int(),
    tokenAddress: z.string().optional(),
  })
  .openapi('CreateProjectBody')
