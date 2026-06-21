import type { Request, Response } from 'express'
import { analysisRequestsService } from '../analysis-requests.service'
import { ListAnalysisRequestsQuerySchema } from '../schemas'

export async function listAnalysisRequestsHandler(req: Request, res: Response) {
  const query = ListAnalysisRequestsQuerySchema.parse(req.query)
  res.json({ items: await analysisRequestsService.list(query) })
}
