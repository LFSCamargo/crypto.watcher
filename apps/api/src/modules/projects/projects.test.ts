import { describe, expect, it } from 'vitest'
import { canTransitionProject, slugify } from './projects.service'

describe('projects.service slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Uniswap V3')).toBe('uniswap-v3')
  })

  it('strips special characters', () => {
    expect(slugify('  Aave! @Protocol  ')).toBe('aave-protocol')
  })

  it('collapses repeated separators', () => {
    expect(slugify('Lido---Finance')).toBe('lido-finance')
  })
})

describe('project lifecycle transitions', () => {
  it('allows the MVP project lifecycle in order', () => {
    expect(canTransitionProject('in_analysis', 'ready')).toBe(true)
    expect(canTransitionProject('ready', 'voting')).toBe(true)
    expect(canTransitionProject('voting', 'closed')).toBe(true)
    expect(canTransitionProject('closed', 'analyzed')).toBe(true)
  })

  it('rejects skipped lifecycle states', () => {
    expect(canTransitionProject('in_analysis', 'voting')).toBe(false)
    expect(canTransitionProject('analyzed', 'ready')).toBe(false)
  })
})
