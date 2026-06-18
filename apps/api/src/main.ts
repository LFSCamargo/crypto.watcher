import { fileURLToPath } from 'node:url'
import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'
import { config } from './core/config'
import { logger } from './core/logger'
import { projectsRoutes } from './modules/projects/projects.routes'

export const app = new Elysia()
  .use(openapi())
  .get('/health', () => ({ status: 'ok' }))
  .use(projectsRoutes)

const isMain = process.argv[1] === fileURLToPath(import.meta.url)

if (isMain) {
  app.listen(config.port)
  logger.info(`API listening on http://localhost:${config.port}`)
}
