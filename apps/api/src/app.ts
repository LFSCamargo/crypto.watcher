import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { errorHandler } from './core/http/error-handler'
import { openApiDocument } from './core/openapi/document'
import { authRoutes } from './modules/auth/auth.routes'
import { commentsRoutes } from './modules/comments/comments.routes'
import { governanceRoutes } from './modules/governance/governance.routes'
import { projectsRoutes } from './modules/projects/projects.routes'
import { reputationRoutes } from './modules/reputation/reputation.routes'
import { scoringRoutes } from './modules/scoring/scoring.routes'
import { usersRoutes } from './modules/users/users.routes'
import { votingRoutes } from './modules/voting/voting.routes'

export const app = express()

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/openapi.json', (_req, res) => {
  res.json(openApiDocument)
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))
app.use('/auth', authRoutes)
app.use(commentsRoutes)
app.use(votingRoutes)
app.use(scoringRoutes)
app.use('/projects', projectsRoutes)
app.use('/users', usersRoutes)
app.use('/reputation', reputationRoutes)
app.use('/governance', governanceRoutes)

app.use(errorHandler)
