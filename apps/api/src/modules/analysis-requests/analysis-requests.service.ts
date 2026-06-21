import type { Selectable } from 'kysely'
import type { AnalysisRequestStatus, AnalysisRequestsTable } from '../../core/db/schema'
import { analysisRequestsRepository } from './analysis-requests.repository'

type AnalysisRequestRow = Selectable<AnalysisRequestsTable>

export const DEFAULT_ANALYSIS_FEE = '0'

export const mapAnalysisRequest = (row: AnalysisRequestRow) => ({
  id: row.id,
  userId: row.user_id,
  projectName: row.project_name,
  projectUrl: row.project_url,
  description: row.description,
  status: row.status,
  paymentTxHash: row.payment_tx_hash,
  feeAmount: row.fee_amount,
  reviewNotes: row.review_notes,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at?.toISOString() ?? null,
})

export const analysisRequestsService = {
  async create(input: {
    userId: string
    projectName: string
    projectUrl: string
    description: string
  }) {
    if (!input.projectName.trim()) throw new Error('INVALID_PROJECT_NAME')
    if (!input.description.trim()) throw new Error('INVALID_DESCRIPTION')

    return mapAnalysisRequest(
      await analysisRequestsRepository.create({
        userId: input.userId,
        projectName: input.projectName.trim(),
        projectUrl: input.projectUrl,
        description: input.description.trim(),
        feeAmount: DEFAULT_ANALYSIS_FEE,
      }),
    )
  },

  async list(filters: { status?: AnalysisRequestStatus }) {
    const rows = await analysisRequestsRepository.list(filters)
    return rows.map(mapAnalysisRequest)
  },

  async listMine(userId: string) {
    const rows = await analysisRequestsRepository.listByUser(userId)
    return rows.map(mapAnalysisRequest)
  },

  async update(
    id: string,
    input: Partial<{
      status: AnalysisRequestStatus
      reviewNotes: string
      paymentTxHash: string
    }>,
  ) {
    const existing = await analysisRequestsRepository.getById(id)
    if (!existing) return undefined

    const updated = await analysisRequestsRepository.update(id, input)
    return updated ? mapAnalysisRequest(updated) : undefined
  },
}
