import type { Request, Response } from 'express'
import { HttpError } from '../../../core/http/validation'
import { analysisRequestsService } from '../analysis-requests.service'
import { CreateAnalysisRequestBodySchema } from '../schemas'

export async function createAnalysisRequestHandler(req: Request, res: Response) {
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
}
