import type { Selectable } from 'kysely'
import type { ScoresTable } from '../../core/db/schema'
import { resolveCreditRatingFromSafetyScore } from '../../lib/ratings/credit-rating'
import { votingService } from '../voting/voting.service'
import { scoringRepository } from './scoring.repository'

type ScoreRow = Selectable<ScoresTable>

export const calculateScore = (weightFor: bigint, weightAgainst: bigint): string => {
  const total = weightFor + weightAgainst
  if (total === 0n) return '0'
  return ((weightFor * 10000n) / total).toString()
}

const mapScore = (score: ScoreRow) => ({
  projectId: score.project_id,
  round: score.round,
  value: score.value,
  breakdown: score.breakdown,
  creditRating: resolveCreditRatingFromSafetyScore(score.value),
})

export const scoringService = {
  async getCurrent(projectId: string) {
    const score = await scoringRepository.getCurrent(projectId)
    return score ? mapScore(score) : undefined
  },

  async getHistory(projectId: string) {
    return (await scoringRepository.getHistory(projectId)).map(mapScore)
  },

  async calculateAndStore(projectId: string, round = 1) {
    const tally = await votingService.getTally(projectId, round)
    const weightFor = BigInt(tally.weightFor)
    const weightAgainst = BigInt(tally.weightAgainst)
    const totalWeight = weightFor + weightAgainst
    const value = calculateScore(weightFor, weightAgainst)
    const score = await scoringRepository.upsertScore({
      projectId,
      round,
      value,
      breakdown: {
        weightFor: tally.weightFor,
        weightAgainst: tally.weightAgainst,
        totalWeight: totalWeight.toString(),
      },
    })
    return mapScore(score)
  },
}
