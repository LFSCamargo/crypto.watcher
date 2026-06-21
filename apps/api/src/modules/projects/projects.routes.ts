import { Router } from 'express'
import { requireAuth, requireTeamOrAdmin } from '../../core/auth/session'
import { asyncHandler, validate } from '../../core/http/validation'
import {
  createProjectHandler,
  getProjectBySlugHandler,
  listProjectsHandler,
  transitionProjectHandler,
  updateProjectHandler,
} from './handlers'
import {
  CreateProjectBodySchema,
  ListProjectsQuerySchema,
  ProjectIdParamsSchema,
  ProjectParamsSchema,
  TransitionProjectBodySchema,
  UpdateProjectBodySchema,
} from './schemas'

export const projectsRoutes = Router()

projectsRoutes.get(
  '/',
  validate({ query: ListProjectsQuerySchema }),
  asyncHandler(listProjectsHandler),
)

projectsRoutes.get(
  '/:slug',
  validate({ params: ProjectParamsSchema }),
  asyncHandler(getProjectBySlugHandler),
)

projectsRoutes.post(
  '/',
  requireAuth,
  requireTeamOrAdmin,
  validate({ body: CreateProjectBodySchema }),
  asyncHandler(createProjectHandler),
)

projectsRoutes.patch(
  '/:id',
  requireAuth,
  requireTeamOrAdmin,
  validate({ params: ProjectIdParamsSchema, body: UpdateProjectBodySchema }),
  asyncHandler(updateProjectHandler),
)

projectsRoutes.post(
  '/:id/transition',
  requireAuth,
  requireTeamOrAdmin,
  validate({ params: ProjectIdParamsSchema, body: TransitionProjectBodySchema }),
  asyncHandler(transitionProjectHandler),
)
