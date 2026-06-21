import { describe, expect, it } from 'vitest'
import {
  CreateAnalysisRequestBodySchema,
  UpdateAnalysisRequestBodySchema,
} from './analysis-requests.schema'
import { analysisRequestsService } from './analysis-requests.service'

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
  it('rejects blank project names before persistence', async () => {
    await expect(
      analysisRequestsService.create({
        userId: '00000000-0000-4000-8000-000000000001',
        projectName: '   ',
        projectUrl: 'https://example.com',
        description: 'Valid description for analysis request.',
      }),
    ).rejects.toThrow('INVALID_PROJECT_NAME')
  })
})
