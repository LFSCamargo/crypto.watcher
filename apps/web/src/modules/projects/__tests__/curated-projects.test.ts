import { describe, expect, it } from 'vitest'
import { curatedProjects, filterCuratedProjects } from '../lib/curated-projects'

describe('filterCuratedProjects', () => {
  it('returns all curated projects for an empty query', () => {
    expect(filterCuratedProjects('')).toHaveLength(curatedProjects.length)
  })

  it('matches by name, symbol, network, and description', () => {
    expect(filterCuratedProjects('btc').map((project) => project.slug)).toEqual([
      'bitcoin',
    ])
    expect(filterCuratedProjects('smart-contract').map((project) => project.slug)).toEqual([
      'ethereum',
      'solana',
      'cardano',
    ])
    expect(filterCuratedProjects('xrp ledger').map((project) => project.slug)).toEqual([
      'xrp',
    ])
  })
})
