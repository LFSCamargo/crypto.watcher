import { Type } from '@sinclair/typebox'

export const ProjectState = Type.Union([
  Type.Literal('in_analysis'),
  Type.Literal('ready'),
  Type.Literal('voting'),
  Type.Literal('closed'),
  Type.Literal('analyzed'),
])

export const Project = Type.Object({
  id: Type.String({ format: 'uuid' }),
  slug: Type.String(),
  name: Type.String({ minLength: 1, maxLength: 120 }),
  description: Type.Optional(Type.String()),
  chainId: Type.Integer(),
  tokenAddress: Type.Optional(Type.String()),
  state: ProjectState,
  votingContractAddress: Type.Optional(Type.String()),
  createdAt: Type.String({ format: 'date-time' }),
})

export const CreateProjectBody = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 120 }),
  description: Type.Optional(Type.String()),
  chainId: Type.Integer(),
  tokenAddress: Type.Optional(Type.String()),
})

export const ListProjectsQuery = Type.Object({
  state: Type.Optional(ProjectState),
  chainId: Type.Optional(Type.Integer()),
  q: Type.Optional(Type.String()),
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
})
