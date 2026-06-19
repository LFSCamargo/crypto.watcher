import { reputationService } from '../reputation/reputation.service'
import { votingRepository } from './voting.repository'

export const votingService = {
  async getTally(projectId: string, round = 1) {
    const tally = await votingRepository.getTally(projectId, round)
    return {
      projectId,
      round,
      weightFor: tally.weight_for,
      weightAgainst: tally.weight_against,
    }
  },

  async getEligibility(address: string) {
    const reputation = await reputationService.getByAddress(address)
    return {
      address: reputation.walletAddress,
      eligible: reputation.eligible,
      weight: reputation.weight,
    }
  },
}
