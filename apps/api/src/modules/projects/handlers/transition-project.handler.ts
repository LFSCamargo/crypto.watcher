import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { projectsService } from '../projects.service'
import { ProjectIdParamsSchema, TransitionProjectBodySchema } from '../schemas'

export async function transitionProjectHandler(req: Request, res: Response) {
  const params = ProjectIdParamsSchema.parse(req.params)
  const body = TransitionProjectBodySchema.parse(req.body)
  const project = await projectsService.transition(params.id, body)
  if (!project) throw new HttpError(404, 'Project not found')
  res.json(project)
}
