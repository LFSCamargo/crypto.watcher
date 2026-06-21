import { describe, expect, it } from 'vitest'
import {
  curatedProjects,
  filterCuratedProjects,
  getCuratedProject,
  getTopRatedProjects,
  projectCategories,
} from '../lib/curated-projects'

describe('curatedProjects', () => {
  it('contains exactly 100 curated projects', () => {
    expect(curatedProjects).toHaveLength(100)
  })

  it('assigns unique ranks from 1 to 100', () => {
    const ranks = curatedProjects.map((project) => project.rank).sort((a, b) => a - b)
    expect(ranks).toEqual(Array.from({ length: 100 }, (_, index) => index + 1))
  })

  it('keeps scores within the expected safety range', () => {
    for (const project of curatedProjects) {
      expect(project.score).toBeGreaterThanOrEqual(70)
      expect(project.score).toBeLessThanOrEqual(98)
    }
  })

  it('lists projects in rank order', () => {
    const ranks = curatedProjects.map((project) => project.rank)
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b))
  })

  it('starts with the expected top projects', () => {
    expect(curatedProjects.slice(0, 3).map((project) => project.slug)).toEqual([
      'bitcoin',
      'ethereum',
      'solana',
    ])
  })

  it('ends with Audius at rank 100', () => {
    const lastProject = curatedProjects.at(-1)
    expect(lastProject?.slug).toBe('audius')
    expect(lastProject?.rank).toBe(100)
  })
})

describe('projectCategories', () => {
  it('maps every category key to a display label', () => {
    expect(Object.keys(projectCategories)).toEqual([
      'layer1',
      'layer2',
      'defi',
      'infrastructure',
      'stablecoin',
      'tokenization',
      'depin',
      'nft',
      'privacy',
      'payments',
    ])
  })
})

describe('filterCuratedProjects', () => {
  it('returns all curated projects for an empty query', () => {
    expect(filterCuratedProjects('')).toHaveLength(curatedProjects.length)
  })

  it('matches by name, symbol, network, and description', () => {
    expect(filterCuratedProjects('btc').map((project) => project.slug)).toEqual(['bitcoin'])
    expect(filterCuratedProjects('xrp ledger').map((project) => project.slug)).toEqual(['xrp'])
    expect(filterCuratedProjects('research-driven').map((project) => project.slug)).toEqual([
      'cardano',
    ])
  })

  it('filters by category when provided', () => {
    const stablecoins = filterCuratedProjects('', curatedProjects, 'stablecoin')
    expect(stablecoins).toHaveLength(2)
    expect(stablecoins.map((project) => project.slug)).toEqual(['usd-coin', 'tether'])
  })

  it('combines text search with category filtering', () => {
    expect(filterCuratedProjects('zk-rollup', curatedProjects, 'layer2').map((p) => p.slug)).toEqual(
      ['starknet', 'scroll'],
    )
  })
})

describe('getCuratedProject', () => {
  it('returns a project by slug', () => {
    expect(getCuratedProject('bitcoin')?.name).toBe('Bitcoin')
    expect(getCuratedProject('chainlink')?.symbol).toBe('LINK')
  })

  it('returns undefined for unknown slugs', () => {
    expect(getCuratedProject('not-a-project')).toBeUndefined()
  })
})

describe('getTopRatedProjects', () => {
  it('returns projects sorted by score descending', () => {
    const topFive = getTopRatedProjects(5)
    expect(topFive).toHaveLength(5)
    expect(topFive.map((project) => project.slug)).toEqual([
      'usd-coin',
      'bitcoin',
      'ethereum',
      'chainlink',
      'uniswap',
    ])
  })

  it('returns all projects when limit exceeds the catalog size', () => {
    expect(getTopRatedProjects(200)).toHaveLength(100)
  })
})
