import type { Request, Response } from 'express'
import { projectsService } from '../projects.service'
import { ListProjectsQuerySchema } from '../schemas'

export async function listProjectsHandler(req: Request, res: Response) {
  const query = ListProjectsQuerySchema.parse(req.query)
  const projects = await projectsService.list(query)
  res.json(projects)
}
