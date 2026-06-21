import { describe, expect, it } from 'vitest'
import {
  evaluateLighthouseAudit,
  normalizeLighthouseScore,
} from '../lib/lighthouse/evaluate-audit'

const thresholds = {
  performance: 50,
  accessibility: 90,
  'best-practices': 90,
  seo: 85,
} as const

describe('normalizeLighthouseScore', () => {
  it('converts fractional Lighthouse scores to 0–100', () => {
    expect(normalizeLighthouseScore(0.87)).toBe(87)
  })

  it('keeps whole-number scores unchanged', () => {
    expect(normalizeLighthouseScore(92)).toBe(92)
  })

  it('returns 0 for missing scores', () => {
    expect(normalizeLighthouseScore(null)).toBe(0)
  })
})

describe('evaluateLighthouseAudit', () => {
  it('passes when all category scores meet thresholds', () => {
    const result = evaluateLighthouseAudit(
      'http://127.0.0.1:4173/',
      {
        performance: 0.85,
        accessibility: 0.95,
        'best-practices': 0.92,
        seo: 0.9,
      },
      thresholds,
    )

    expect(result.passed).toBe(true)
    expect(result.categories.every((entry) => entry.passed)).toBe(true)
  })

  it('fails when any category is below its threshold', () => {
    const result = evaluateLighthouseAudit(
      'http://127.0.0.1:4173/blog',
      {
        performance: 0.85,
        accessibility: 0.7,
        'best-practices': 0.92,
        seo: 0.9,
      },
      thresholds,
    )

    expect(result.passed).toBe(false)
    expect(result.categories.find((entry) => entry.category === 'accessibility')?.passed).toBe(
      false,
    )
  })
})
