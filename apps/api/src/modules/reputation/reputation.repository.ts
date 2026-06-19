import { db } from '../../core/db'
import { normalizeAddress } from '../../shared/address'

export const reputationRepository = {
  async getByAddress(address: string) {
    return db
      .selectFrom('reputation')
      .selectAll()
      .where('wallet_address', '=', normalizeAddress(address))
      .executeTakeFirst()
  },
}
