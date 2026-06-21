import { describe, expect, it } from 'vitest'
import { buildProjectSearchResults } from '../lib/search-projects'

describe('buildProjectSearchResults', () => {
  it('returns curated matches with symbol and slug metadata', () => {
    const results = buildProjectSearchResults('stellar', [])
    expect(results[0]).toMatchObject({
      title: 'Stellar',
      symbol: 'XLM',
      slug: 'stellar',
      kind: 'reference',
      to: '/app/reference/stellar',
    })
  })

  it('caps results at the shared search limit', () => {
    const results = buildProjectSearchResults('a', [])
    expect(results.length).toBeLessThanOrEqual(10)
  })
})
