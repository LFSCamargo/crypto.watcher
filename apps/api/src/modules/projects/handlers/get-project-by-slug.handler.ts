import type { Request, Response } from 'express'
import { projectsService } from '../projects.service'
import { ProjectParamsSchema } from '../schemas'

export async function getProjectBySlugHandler(req: Request, res: Response) {
  const params = ProjectParamsSchema.parse(req.params)
  const project = await projectsService.getBySlug(params.slug)

  if (!project) {
    res.status(404).json({ message: 'Project not found' })
    return
  }

  res.json(project)
}
