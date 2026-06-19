import { describe, expect, it } from 'vitest'
import { formatProjectState } from '../lib/format'

describe('formatProjectState', () => {
  it('maps lifecycle states to labels', () => {
    expect(formatProjectState('in_analysis')).toBe('In analysis')
    expect(formatProjectState('voting')).toBe('Voting')
    expect(formatProjectState('analyzed')).toBe('Analyzed')
  })
})
