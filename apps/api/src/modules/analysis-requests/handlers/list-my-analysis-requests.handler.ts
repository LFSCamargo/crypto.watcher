import type { Request, Response } from 'express'
import { analysisRequestsService } from '../analysis-requests.service'

export async function listMyAnalysisRequestsHandler(_req: Request, res: Response) {
  res.json({ items: await analysisRequestsService.listMine(res.locals.user.id) })
}
