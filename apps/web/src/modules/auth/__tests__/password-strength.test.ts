import { describe, expect, it } from 'vitest'
import { analyzePasswordStrength, passwordsMatch } from '../lib/password-strength'

describe('analyzePasswordStrength', () => {
  it('flags missing requirements for a short password', () => {
    const result = analyzePasswordStrength('abc')

    expect(result.meetsMinimum).toBe(false)
    expect(result.level).toBe('weak')
    expect(result.suggestions).toContain('Use at least 8 characters.')
  })

  it('returns fair or better for a valid mixed password', () => {
    const result = analyzePasswordStrength('Password1!')

    expect(result.meetsMinimum).toBe(true)
    expect(['fair', 'good', 'strong']).toContain(result.level)
  })

  it('returns strong for a long mixed password', () => {
    const result = analyzePasswordStrength('MySecurePass123!')

    expect(result.level).toBe('strong')
    expect(result.score).toBeGreaterThanOrEqual(5)
  })
})

describe('passwordsMatch', () => {
  it('returns true only when both values match', () => {
    expect(passwordsMatch('Password1!', 'Password1!')).toBe(true)
    expect(passwordsMatch('Password1!', 'Password2!')).toBe(false)
  })
})
