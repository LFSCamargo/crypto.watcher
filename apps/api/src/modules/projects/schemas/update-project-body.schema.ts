import { CreateProjectBodySchema } from './create-project-body.schema'

export const UpdateProjectBodySchema =
  CreateProjectBodySchema.partial().openapi('UpdateProjectBody')
