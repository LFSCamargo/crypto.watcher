import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { projectsService } from '../projects.service'
import { ProjectIdParamsSchema, UpdateProjectBodySchema } from '../schemas'

export async function updateProjectHandler(req: Request, res: Response) {
  const params = ProjectIdParamsSchema.parse(req.params)
  const body = UpdateProjectBodySchema.parse(req.body)
  const project = await projectsService.update(params.id, body)
  if (!project) throw new HttpError(404, 'Project not found')
  res.json(project)
}
