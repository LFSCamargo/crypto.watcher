import { describe, expect, it } from 'vitest'
import { calculateScore } from './scoring.service'

describe('calculateScore', () => {
  it('returns zero when there is no vote weight', () => {
    expect(calculateScore(0n, 0n)).toBe('0')
  })

  it('returns basis points of weighted support', () => {
    expect(calculateScore(75n, 25n)).toBe('7500')
  })
})
