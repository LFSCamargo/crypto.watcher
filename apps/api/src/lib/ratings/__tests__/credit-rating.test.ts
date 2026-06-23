import { describe, expect, it } from 'vitest'
import { resolveCreditRatingFromSafetyScore } from '../credit-rating'

describe('credit-rating', () => {
  it('maps safety scores to paired agency grades', () => {
    expect(resolveCreditRatingFromSafetyScore(96)).toEqual({
      sp: 'AA',
      moodys: 'Aa',
      group: 'investment_grade',
    })
  })
})
