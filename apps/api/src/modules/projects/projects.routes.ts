import { Router } from 'express'
import { requireAuth, requireTeamOrAdmin } from '../../core/auth/session'
import { asyncHandler, HttpError, validate } from '../../core/http/validation'
import { projectsService } from './projects.service'
import {
  CreateProjectBodySchema,
  ListProjectsQuerySchema,
  ProjectIdParamsSchema,
  ProjectParamsSchema,
  TransitionProjectBodySchema,
  UpdateProjectBodySchema,
} from './projects.schema'

export const projectsRoutes = Router()

projectsRoutes.get(
  '/',
  validate({ query: ListProjectsQuerySchema }),
  asyncHandler(async (req, res) => {
    const query = ListProjectsQuerySchema.parse(req.query)
    const projects = await projectsService.list(query)
    res.json(projects)
  }),
)

projectsRoutes.get(
  '/:slug',
  validate({ params: ProjectParamsSchema }),
  asyncHandler(async (req, res) => {
    const params = ProjectParamsSchema.parse(req.params)
    const project = await projectsService.getBySlug(params.slug)

    if (!project) {
      res.status(404).json({ message: 'Project not found' })
      return
    }

    res.json(project)
  }),
)

projectsRoutes.post(
  '/',
  requireAuth,
  requireTeamOrAdmin,
  validate({ body: CreateProjectBodySchema }),
  asyncHandler(async (req, res) => {
    const body = CreateProjectBodySchema.parse(req.body)
    const project = await projectsService.create(body)
    res.status(201).json(project)
  }),
)

projectsRoutes.patch(
  '/:id',
  requireAuth,
  requireTeamOrAdmin,
  validate({ params: ProjectIdParamsSchema, body: UpdateProjectBodySchema }),
  asyncHandler(async (req, res) => {
    const params = ProjectIdParamsSchema.parse(req.params)
    const body = UpdateProjectBodySchema.parse(req.body)
    const project = await projectsService.update(params.id, body)
    if (!project) throw new HttpError(404, 'Project not found')
    res.json(project)
  }),
)

projectsRoutes.post(
  '/:id/transition',
  requireAuth,
  requireTeamOrAdmin,
  validate({ params: ProjectIdParamsSchema, body: TransitionProjectBodySchema }),
  asyncHandler(async (req, res) => {
    const params = ProjectIdParamsSchema.parse(req.params)
    const body = TransitionProjectBodySchema.parse(req.body)
    const project = await projectsService.transition(params.id, body)
    if (!project) throw new HttpError(404, 'Project not found')
    res.json(project)
  }),
)
