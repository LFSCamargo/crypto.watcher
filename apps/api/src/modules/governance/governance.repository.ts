import { db } from '../../core/db'
import type { GovernanceProposalState } from '../../core/db/schema'

export const governanceRepository = {
  async list(filters: { state?: GovernanceProposalState }) {
    let query = db.selectFrom('governance_proposals').selectAll()
    if (filters.state) query = query.where('state', '=', filters.state)
    return query.orderBy('created_at', 'desc').execute()
  },

  async getByOnchainId(onchainId: string) {
    return db
      .selectFrom('governance_proposals')
      .selectAll()
      .where('onchain_id', '=', onchainId)
      .executeTakeFirst()
  },
}
