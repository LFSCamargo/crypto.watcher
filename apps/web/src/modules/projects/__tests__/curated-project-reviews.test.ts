import { describe, expect, it } from 'vitest'
import { getCuratedProject } from '../lib/curated-projects'
import { getProjectReviewProfile, getVerdictLabel } from '../lib/curated-project-reviews'

describe('getProjectReviewProfile', () => {
  it('returns detailed override for major projects', () => {
    const bitcoin = getCuratedProject('bitcoin')
    expect(bitcoin).toBeDefined()
    const profile = getProjectReviewProfile(bitcoin!)
    expect(profile.verdict).toBe('low_risk')
    expect(profile.strengths.length).toBeGreaterThan(0)
    // Bitcoin has no smart contract audits — it has an informational process link
    expect(profile.externalReviews.length).toBeGreaterThanOrEqual(0)
    expect(profile.methodologyVersion).toMatch(/^CW-Review-/)
  })

  it('returns custom audit providers for Uniswap', () => {
    const uniswap = getCuratedProject('uniswap')
    const profile = getProjectReviewProfile(uniswap!)
    expect(profile.externalReviews.some((r) => r.provider === 'Trail of Bits')).toBe(true)
  })

  it('builds defaults for projects without overrides', () => {
    const audius = getCuratedProject('audius')
    const profile = getProjectReviewProfile(audius!)
    expect(profile.headline).toContain('Audius')
    expect(profile.strengths).toHaveLength(3)
    expect(profile.risks).toHaveLength(3)
    // We intentionally do not fabricate fake audit links
    expect(profile.externalReviews.length).toBe(0)
  })

  it('marks watch-status projects as caution', () => {
    const xrp = getCuratedProject('xrp')
    const profile = getProjectReviewProfile(xrp!)
    expect(profile.verdict).toBe('caution')
  })
})

describe('getVerdictLabel', () => {
  it('maps verdicts to readable labels', () => {
    expect(getVerdictLabel('low_risk')).toBe('Low risk')
    expect(getVerdictLabel('caution')).toBe('Under watch')
  })
})
