import { describe, expect, it } from 'vitest'
import {
  CREDIT_RATING_SCALE,
  getCreditRatingGroupLabel,
  normalizeSafetyScore,
  resolveCreditRatingFromSafetyScore,
  resolveCreditRatingGroup,
} from '../../lib/ratings/credit-rating'

describe('credit-rating', () => {
  it('maps high safety scores to investment-grade S&P and Moody labels', () => {
    expect(resolveCreditRatingFromSafetyScore(97)).toEqual({
      sp: 'AAA',
      moodys: 'Aaa',
      group: 'investment_grade',
    })
    expect(resolveCreditRatingFromSafetyScore(85)).toEqual({
      sp: 'BBB',
      moodys: 'Baa',
      group: 'investment_grade',
    })
  })

  it('maps mid scores to speculative grade', () => {
    expect(resolveCreditRatingFromSafetyScore(78)).toEqual({
      sp: 'BB',
      moodys: 'Ba',
      group: 'speculative_grade',
    })
    expect(resolveCreditRatingFromSafetyScore(30)).toEqual({
      sp: 'D',
      moodys: 'D',
      group: 'speculative_grade',
    })
  })

  it('normalizes basis-point vote scores before mapping', () => {
    expect(normalizeSafetyScore('7500')).toBe(75)
    expect(resolveCreditRatingFromSafetyScore(7500)).toEqual({
      sp: 'B',
      moodys: 'B',
      group: 'speculative_grade',
    })
  })

  it('forces default when flagged', () => {
    expect(resolveCreditRatingFromSafetyScore(99, { forceDefault: true }).sp).toBe('D')
  })

  it('classifies BBB as investment grade and BB as speculative', () => {
    expect(resolveCreditRatingGroup('BBB')).toBe('investment_grade')
    expect(resolveCreditRatingGroup('BB')).toBe('speculative_grade')
  })

  it('labels rating groups for display', () => {
    expect(getCreditRatingGroupLabel('investment_grade')).toBe('Investment grade')
    expect(getCreditRatingGroupLabel('speculative_grade')).toBe('Speculative grade')
  })

  it('keeps scale ordered from AAA to D', () => {
    expect(CREDIT_RATING_SCALE[0]?.sp).toBe('AAA')
    expect(CREDIT_RATING_SCALE.at(-1)?.sp).toBe('D')
  })
})
