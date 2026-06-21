import { Router } from 'express'
import { requireAuth, requireTeamOrAdmin } from '../../core/auth/session'
import { asyncHandler, HttpError, validate } from '../../core/http/validation'
import {
  AnalysisRequestParamsSchema,
  CreateAnalysisRequestBodySchema,
  ListAnalysisRequestsQuerySchema,
  UpdateAnalysisRequestBodySchema,
} from './analysis-requests.schema'
import { analysisRequestsService } from './analysis-requests.service'

export const analysisRequestsRoutes = Router()

analysisRequestsRoutes.post(
  '/',
  requireAuth,
  validate({ body: CreateAnalysisRequestBodySchema }),
  asyncHandler(async (req, res) => {
    const body = CreateAnalysisRequestBodySchema.parse(req.body)
    try {
      const request = await analysisRequestsService.create({
        userId: res.locals.user.id,
        projectName: body.projectName,
        projectUrl: body.projectUrl,
        description: body.description,
      })
      res.status(201).json(request)
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('INVALID_')) {
        throw new HttpError(400, 'Invalid analysis request')
      }
      throw error
    }
  }),
)

analysisRequestsRoutes.get(
  '/me',
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json({ items: await analysisRequestsService.listMine(res.locals.user.id) })
  }),
)

analysisRequestsRoutes.get(
  '/',
  validate({ query: ListAnalysisRequestsQuerySchema }),
  asyncHandler(async (req, res) => {
    const query = ListAnalysisRequestsQuerySchema.parse(req.query)
    res.json({ items: await analysisRequestsService.list(query) })
  }),
)

analysisRequestsRoutes.patch(
  '/:id',
  requireAuth,
  requireTeamOrAdmin,
  validate({ params: AnalysisRequestParamsSchema, body: UpdateAnalysisRequestBodySchema }),
  asyncHandler(async (req, res) => {
    const params = AnalysisRequestParamsSchema.parse(req.params)
    const body = UpdateAnalysisRequestBodySchema.parse(req.body)
    const updated = await analysisRequestsService.update(params.id, {
      status: body.status,
      reviewNotes: body.reviewNotes,
      paymentTxHash: body.paymentTxHash,
    })
    if (!updated) throw new HttpError(404, 'Analysis request not found')
    res.json(updated)
  }),
)
