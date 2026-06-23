import { describe, expect, it } from 'vitest'
import {
  sortCuratedProjectsByRating,
  type CuratedProject,
} from '../../modules/projects/lib/curated-projects'

function project(overrides: Partial<CuratedProject> & Pick<CuratedProject, 'slug' | 'name' | 'score'>): CuratedProject {
  return {
    symbol: overrides.slug.toUpperCase(),
    rank: 1,
    category: 'layer1',
    network: 'Test',
    status: 'reference',
    description: 'Test project',
    sourceUrl: 'https://example.com',
    projectUrl: 'https://example.com',
    ...overrides,
  }
}

describe('sortCuratedProjectsByRating', () => {
  it('orders AAA before AA and investment grade before speculative', () => {
    const sorted = sortCuratedProjectsByRating([
      project({ slug: 'b-rated', name: 'B Rated', score: 72 }),
      project({ slug: 'bitcoin', name: 'Bitcoin', score: 96 }),
      project({ slug: 'aa-rated', name: 'AA Rated', score: 95 }),
      project({ slug: 'bbb-rated', name: 'BBB Rated', score: 86 }),
    ])

    expect(sorted.map((item) => item.slug)).toEqual([
      'bitcoin',
      'aa-rated',
      'bbb-rated',
      'b-rated',
    ])
  })

  it('pushes watch-list projects to the bottom as D', () => {
    const sorted = sortCuratedProjectsByRating([
      project({ slug: 'watch', name: 'Watch Token', score: 99, status: 'watch' }),
      project({ slug: 'safe', name: 'Safe Token', score: 86, status: 'safe' }),
    ])

    expect(sorted[0]?.slug).toBe('safe')
    expect(sorted.at(-1)?.slug).toBe('watch')
  })

  it('breaks ties within the same grade by safety score', () => {
    const sorted = sortCuratedProjectsByRating([
      project({ slug: 'lower-aa', name: 'Lower AA', score: 94 }),
      project({ slug: 'higher-aa', name: 'Higher AA', score: 96 }),
    ])

    expect(sorted.map((item) => item.slug)).toEqual(['higher-aa', 'lower-aa'])
  })
})
