import { db } from '../../core/db'
import type { AnalysisRequestStatus } from '../../core/db/schema'

export const analysisRequestsRepository = {
  async create(input: {
    userId: string
    projectName: string
    projectUrl: string
    description: string
    feeAmount: string
  }) {
    return db
      .insertInto('analysis_requests')
      .values({
        user_id: input.userId,
        project_name: input.projectName,
        project_url: input.projectUrl,
        description: input.description,
        fee_amount: input.feeAmount,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  async list(filters: { status?: AnalysisRequestStatus }) {
    let query = db.selectFrom('analysis_requests').selectAll()
    if (filters.status) query = query.where('status', '=', filters.status)
    return query.orderBy('created_at', 'desc').execute()
  },

  async listByUser(userId: string) {
    return db
      .selectFrom('analysis_requests')
      .selectAll()
      .where('user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .execute()
  },

  async getById(id: string) {
    return db
      .selectFrom('analysis_requests')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
  },

  async update(
    id: string,
    input: Partial<{
      status: AnalysisRequestStatus
      reviewNotes: string
      paymentTxHash: string
    }>,
  ) {
    return db
      .updateTable('analysis_requests')
      .set({
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.reviewNotes !== undefined ? { review_notes: input.reviewNotes } : {}),
        ...(input.paymentTxHash !== undefined
          ? { payment_tx_hash: input.paymentTxHash }
          : {}),
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  },
}
