import { Elysia, t } from 'elysia'
import { projectsService } from './projects.service'
import { CreateProjectBody, ListProjectsQuery } from './projects.schema'

export const projectsRoutes = new Elysia({ prefix: '/projects', tags: ['projects'] })
  .get(
    '/',
    ({ query }) =>
      projectsService.list({
        state: query.state,
        chainId: query.chainId,
        q: query.q,
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      }),
    { query: ListProjectsQuery },
  )
  .get('/:slug', async ({ params, status }) => {
    const project = await projectsService.getBySlug(params.slug)
    if (!project) return status(404, { message: 'Project not found' })
    return project
  }, { params: t.Object({ slug: t.String() }) })
  .post('/', ({ body }) => projectsService.create(body), { body: CreateProjectBody })
