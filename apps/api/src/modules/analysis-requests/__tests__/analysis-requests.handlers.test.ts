import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '../../../core/http/validation'
import { mockRequest, mockResponse } from '../../../test/http-mocks'
import { createAnalysisRequestHandler } from '../handlers/create-analysis-request.handler'
import { listAnalysisRequestsHandler } from '../handlers/list-analysis-requests.handler'
import { listMyAnalysisRequestsHandler } from '../handlers/list-my-analysis-requests.handler'
import { updateAnalysisRequestHandler } from '../handlers/update-analysis-request.handler'

vi.mock('../analysis-requests.service', () => ({
  analysisRequestsService: {
    create: vi.fn(),
    list: vi.fn(),
    listMine: vi.fn(),
    update: vi.fn(),
  },
}))

import { analysisRequestsService } from '../analysis-requests.service'

const userId = '33333333-3333-4333-8333-333333333333'
const requestId = '44444444-4444-4444-8444-444444444444'

const analysisRequest = {
  id: requestId,
  userId,
  projectName: 'Example Protocol',
  projectUrl: 'https://example.com',
  description: 'A detailed project description for analysis.',
  status: 'pending' as const,
  paymentTxHash: null,
  feeAmount: '0',
  reviewNotes: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: null,
}

describe('analysis-requests handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createAnalysisRequestHandler creates a request', async () => {
    vi.mocked(analysisRequestsService.create).mockResolvedValue(analysisRequest)

    const req = mockRequest({
      body: {
        projectName: 'Example Protocol',
        projectUrl: 'https://example.com',
        description: 'A detailed project description for analysis.',
      },
    })
    const res = mockResponse()
    res.locals.user = { id: userId }

    await createAnalysisRequestHandler(req, res)

    expect(analysisRequestsService.create).toHaveBeenCalledWith({
      userId,
      projectName: 'Example Protocol',
      projectUrl: 'https://example.com',
      description: 'A detailed project description for analysis.',
    })
    expect(res.statusCode).toBe(201)
    expect(res.body).toEqual(analysisRequest)
  })

  it('createAnalysisRequestHandler returns 400 for invalid input', async () => {
    vi.mocked(analysisRequestsService.create).mockRejectedValue(new Error('INVALID_DESCRIPTION'))

    const req = mockRequest({
      body: {
        projectName: 'Example Protocol',
        projectUrl: 'https://example.com',
        description: 'A detailed project description for analysis.',
      },
    })
    const res = mockResponse()
    res.locals.user = { id: userId }

    await expect(createAnalysisRequestHandler(req, res)).rejects.toEqual(
      new HttpError(400, 'Invalid analysis request'),
    )
  })

  it('listAnalysisRequestsHandler returns filtered requests', async () => {
    vi.mocked(analysisRequestsService.list).mockResolvedValue([analysisRequest])

    const req = mockRequest({ query: { status: 'pending' } })
    const res = mockResponse()

    await listAnalysisRequestsHandler(req, res)

    expect(analysisRequestsService.list).toHaveBeenCalledWith({ status: 'pending' })
    expect(res.body).toEqual({ items: [analysisRequest] })
  })

  it('listMyAnalysisRequestsHandler returns user requests', async () => {
    vi.mocked(analysisRequestsService.listMine).mockResolvedValue([analysisRequest])

    const req = mockRequest()
    const res = mockResponse()
    res.locals.user = { id: userId }

    await listMyAnalysisRequestsHandler(req, res)

    expect(analysisRequestsService.listMine).toHaveBeenCalledWith(userId)
    expect(res.body).toEqual({ items: [analysisRequest] })
  })

  it('updateAnalysisRequestHandler updates a request', async () => {
    const updated = { ...analysisRequest, status: 'in_review' as const }
    vi.mocked(analysisRequestsService.update).mockResolvedValue(updated)

    const req = mockRequest({
      params: { id: requestId },
      body: { status: 'in_review', reviewNotes: 'Queued' },
    })
    const res = mockResponse()

    await updateAnalysisRequestHandler(req, res)

    expect(analysisRequestsService.update).toHaveBeenCalledWith(requestId, {
      status: 'in_review',
      reviewNotes: 'Queued',
      paymentTxHash: undefined,
    })
    expect(res.body).toEqual(updated)
  })

  it('updateAnalysisRequestHandler returns 404 when missing', async () => {
    vi.mocked(analysisRequestsService.update).mockResolvedValue(undefined)

    const req = mockRequest({ params: { id: requestId }, body: { status: 'in_review' } })
    const res = mockResponse()

    await expect(updateAnalysisRequestHandler(req, res)).rejects.toEqual(
      new HttpError(404, 'Analysis request not found'),
    )
  })
})
