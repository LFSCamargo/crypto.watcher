import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { config } from './core/config'
import { getHealth, getOpenApiDocument } from './core/http/handlers/system.handlers'
import { errorHandler } from './core/http/error-handler'
import { openApiDocument } from './core/openapi/document'
import { analysisRequestsRoutes } from './modules/analysis-requests/analysis-requests.routes'
import { authRoutes } from './modules/auth/auth.routes'
import { commentsRoutes } from './modules/comments/comments.routes'
import { governanceRoutes } from './modules/governance/governance.routes'
import { marketRoutes } from './modules/market/market.routes'
import { projectsRoutes } from './modules/projects/projects.routes'
import { reputationRoutes } from './modules/reputation/reputation.routes'
import { scoringRoutes } from './modules/scoring/scoring.routes'
import { usersRoutes } from './modules/users/users.routes'
import { votingRoutes } from './modules/voting/voting.routes'

export const app = express()

app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  }),
)
app.use(express.json())

app.get('/health', getHealth)
app.get('/openapi.json', getOpenApiDocument)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))
app.use('/auth', authRoutes)
app.use('/analysis-requests', analysisRequestsRoutes)
app.use(commentsRoutes)
app.use(votingRoutes)
app.use(scoringRoutes)
app.use('/projects', projectsRoutes)
app.use('/market', marketRoutes)
app.use('/users', usersRoutes)
app.use('/reputation', reputationRoutes)
app.use('/governance', governanceRoutes)

app.use(errorHandler)
