import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { analysisRequestsService } from '../analysis-requests.service'
import { AnalysisRequestParamsSchema, UpdateAnalysisRequestBodySchema } from '../schemas'

export async function updateAnalysisRequestHandler(req: Request, res: Response) {
  const params = AnalysisRequestParamsSchema.parse(req.params)
  const body = UpdateAnalysisRequestBodySchema.parse(req.body)
  const updated = await analysisRequestsService.update(params.id, {
    status: body.status,
    reviewNotes: body.reviewNotes,
    paymentTxHash: body.paymentTxHash,
  })
  if (!updated) throw new HttpError(404, 'Analysis request not found')
  res.json(updated)
}
