import type { Request, Response } from 'express'
import { projectsService } from '../projects.service'
import { CreateProjectBodySchema } from '../schemas'

export async function createProjectHandler(req: Request, res: Response) {
  const body = CreateProjectBodySchema.parse(req.body)
  const project = await projectsService.create(body)
  res.status(201).json(project)
}
