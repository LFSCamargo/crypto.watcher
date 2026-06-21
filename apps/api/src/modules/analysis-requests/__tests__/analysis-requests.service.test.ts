import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CreateAnalysisRequestBodySchema,
  UpdateAnalysisRequestBodySchema,
} from '../schemas'
import { analysisRequestsService, mapAnalysisRequest } from '../analysis-requests.service'

vi.mock('../analysis-requests.repository', () => ({
  analysisRequestsRepository: {
    create: vi.fn(),
    list: vi.fn(),
    listByUser: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
  },
}))

import { analysisRequestsRepository } from '../analysis-requests.repository'

const now = new Date('2024-01-01T00:00:00.000Z')

const row = {
  id: '11111111-1111-4111-8111-111111111111',
  user_id: '22222222-2222-4222-8222-222222222222',
  project_name: 'Example Protocol',
  project_url: 'https://example.com',
  description: 'Detailed analysis request description.',
  status: 'pending' as const,
  payment_tx_hash: null,
  fee_amount: '0',
  review_notes: null,
  created_at: now,
  updated_at: null,
}

describe('analysis request schemas', () => {
  it('requires a valid project URL and description length', () => {
    const valid = CreateAnalysisRequestBodySchema.safeParse({
      projectName: 'Example Protocol',
      projectUrl: 'https://example.com',
      description: 'A detailed project description for analysis.',
    })
    const invalidUrl = CreateAnalysisRequestBodySchema.safeParse({
      projectName: 'Example Protocol',
      projectUrl: 'not-a-url',
      description: 'A detailed project description for analysis.',
    })
    const shortDescription = CreateAnalysisRequestBodySchema.safeParse({
      projectName: 'Example Protocol',
      projectUrl: 'https://example.com',
      description: 'too short',
    })

    expect(valid.success).toBe(true)
    expect(invalidUrl.success).toBe(false)
    expect(shortDescription.success).toBe(false)
  })

  it('accepts optional team review fields', () => {
    const result = UpdateAnalysisRequestBodySchema.safeParse({
      status: 'in_review',
      reviewNotes: 'Queued for team review.',
    })

    expect(result.success).toBe(true)
  })
})

describe('analysisRequestsService validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mapAnalysisRequest maps database rows', () => {
    expect(mapAnalysisRequest(row)).toEqual({
      id: row.id,
      userId: row.user_id,
      projectName: row.project_name,
      projectUrl: row.project_url,
      description: row.description,
      status: row.status,
      paymentTxHash: row.payment_tx_hash,
      feeAmount: row.fee_amount,
      reviewNotes: row.review_notes,
      createdAt: now.toISOString(),
      updatedAt: null,
    })
  })

  it('rejects blank project names before persistence', async () => {
    await expect(
      analysisRequestsService.create({
        userId: row.user_id,
        projectName: '   ',
        projectUrl: 'https://example.com',
        description: 'Valid description for analysis request.',
      }),
    ).rejects.toThrow('INVALID_PROJECT_NAME')
  })

  it('rejects blank descriptions before persistence', async () => {
    await expect(
      analysisRequestsService.create({
        userId: row.user_id,
        projectName: 'Example',
        projectUrl: 'https://example.com',
        description: '   ',
      }),
    ).rejects.toThrow('INVALID_DESCRIPTION')
  })

  it('create trims input and maps persisted rows', async () => {
    vi.mocked(analysisRequestsRepository.create).mockResolvedValue(row)

    const result = await analysisRequestsService.create({
      userId: row.user_id,
      projectName: '  Example Protocol  ',
      projectUrl: row.project_url,
      description: '  Detailed analysis request description.  ',
    })

    expect(analysisRequestsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        projectName: 'Example Protocol',
        description: 'Detailed analysis request description.',
      }),
    )
    expect(result.projectName).toBe('Example Protocol')
  })

  it('list maps repository rows', async () => {
    vi.mocked(analysisRequestsRepository.list).mockResolvedValue([row])

    const result = await analysisRequestsService.list({ status: 'pending' })

    expect(result).toHaveLength(1)
    expect(result[0]?.status).toBe('pending')
  })

  it('listMine maps user-specific rows', async () => {
    vi.mocked(analysisRequestsRepository.listByUser).mockResolvedValue([row])

    const result = await analysisRequestsService.listMine(row.user_id)

    expect(result[0]?.userId).toBe(row.user_id)
  })

  it('update returns undefined when request is missing', async () => {
    vi.mocked(analysisRequestsRepository.getById).mockResolvedValue(undefined)

    await expect(
      analysisRequestsService.update(row.id, { status: 'in_review' }),
    ).resolves.toBeUndefined()
  })

  it('update maps persisted changes', async () => {
    vi.mocked(analysisRequestsRepository.getById).mockResolvedValue(row)
    vi.mocked(analysisRequestsRepository.update).mockResolvedValue({
      ...row,
      status: 'in_review',
      review_notes: 'Queued',
      updated_at: now,
    })

    const result = await analysisRequestsService.update(row.id, {
      status: 'in_review',
      reviewNotes: 'Queued',
    })

    expect(result?.status).toBe('in_review')
    expect(result?.reviewNotes).toBe('Queued')
  })
})
