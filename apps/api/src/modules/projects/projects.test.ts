import { describe, expect, it } from 'vitest'
import { slugify } from './projects.service'

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
