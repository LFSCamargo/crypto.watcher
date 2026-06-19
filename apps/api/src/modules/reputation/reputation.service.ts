import type { Selectable } from 'kysely'
import type { ReputationTable } from '../../core/db/schema'
import { normalizeAddress } from '../../shared/address'
import { reputationRepository } from './reputation.repository'

type ReputationRow = Selectable<ReputationTable>

export const mapReputation = (reputation: ReputationRow) => ({
  walletAddress: reputation.wallet_address,
  eligible: reputation.eligible,
  weight: reputation.weight,
  factors: reputation.factors,
})

export const reputationService = {
  async getByAddress(address: string) {
    const reputation = await reputationRepository.getByAddress(address)
    return (
      (reputation && mapReputation(reputation)) ?? {
        walletAddress: normalizeAddress(address),
        eligible: false,
        weight: '0',
        factors: null,
      }
    )
  },
}
