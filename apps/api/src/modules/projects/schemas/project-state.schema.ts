import { z } from '../../../core/openapi/zod'

export const ProjectStateSchema = z
  .enum(['in_analysis', 'ready', 'voting', 'closed', 'analyzed'])
  .openapi('ProjectState')

export type ProjectState = z.infer<typeof ProjectStateSchema>
