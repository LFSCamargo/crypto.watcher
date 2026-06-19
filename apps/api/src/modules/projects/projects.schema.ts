import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export const ProjectStateSchema = z
  .enum(['in_analysis', 'ready', 'voting', 'closed', 'analyzed'])
  .openapi('ProjectState')

export type ProjectState = z.infer<typeof ProjectStateSchema>

export const ProjectSchema = z
  .object({
    id: z.uuid(),
    slug: z.string(),
    name: z.string().min(1).max(120),
    description: z.string().nullable().optional(),
    chainId: z.number().int(),
    tokenAddress: z.string().nullable().optional(),
    state: ProjectStateSchema,
    votingContractAddress: z.string().nullable().optional(),
    createdAt: z.iso.datetime(),
  })
  .openapi('Project')

export const CreateProjectBodySchema = z
  .object({
    name: z.string().min(1).max(120),
    description: z.string().optional(),
    chainId: z.number().int(),
    tokenAddress: z.string().optional(),
  })
  .openapi('CreateProjectBody')

export const UpdateProjectBodySchema =
  CreateProjectBodySchema.partial().openapi('UpdateProjectBody')

export const TransitionProjectBodySchema = z
  .object({
    state: ProjectStateSchema,
    votingContractAddress: z.string().optional(),
  })
  .openapi('TransitionProjectBody')

export const ListProjectsQuerySchema = z.object({
  state: ProjectStateSchema.optional(),
  chainId: z.coerce.number().int().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const ProjectParamsSchema = z.object({
  slug: z.string().min(1),
})

export const ProjectIdParamsSchema = z.object({
  id: z.uuid(),
})

export const ErrorResponseSchema = z
  .object({
    message: z.string(),
  })
  .openapi('ErrorResponse')
