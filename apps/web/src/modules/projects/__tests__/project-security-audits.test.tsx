import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/render'
import { ProjectSecurityAudits } from '../components/project-security-audits'
import { getCuratedProject } from '../lib/curated-projects'
import { getProjectReviewProfile } from '../lib/curated-project-reviews'

describe('ProjectSecurityAudits', () => {
  it('lists external security reviews when present', () => {
    const profile = getProjectReviewProfile(getCuratedProject('bitcoin')!)

    renderWithProviders(<ProjectSecurityAudits profile={profile} />)

    expect(screen.getByText('External security reviews')).toBeInTheDocument()
    expect(screen.getByText(profile.externalReviews[0]!.title)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View report/i })).toHaveAttribute(
      'href',
      profile.externalReviews[0]!.url,
    )
  })

  it('shows a fallback message when no audits are indexed', () => {
    const profile = getProjectReviewProfile(getCuratedProject('bitcoin')!)
    const profileWithoutAudits = { ...profile, externalReviews: [] }

    renderWithProviders(<ProjectSecurityAudits profile={profileWithoutAudits} />)

    expect(
      screen.getByText(/No specific public smart contract audit report/i),
    ).toBeInTheDocument()
  })

  it('labels each external review status variant', () => {
    const profile = getProjectReviewProfile(getCuratedProject('bitcoin')!)
    const profileWithStatuses = {
      ...profile,
      externalReviews: [
        {
          provider: 'CertiK' as const,
          title: 'Core contracts',
          completedAt: '2024-01',
          url: 'https://example.com/certik',
          status: 'passed_with_issues' as const,
        },
        {
          provider: 'OpenZeppelin' as const,
          title: 'Bridge audit',
          completedAt: '2024-02',
          url: 'https://example.com/oz',
          status: 'monitoring' as const,
          scope: 'Bridge',
        },
      ],
    }

    renderWithProviders(<ProjectSecurityAudits profile={profileWithStatuses} />)

    expect(screen.getByText('Passed with findings')).toBeInTheDocument()
    expect(screen.getByText('Ongoing monitoring')).toBeInTheDocument()
    expect(screen.getByText('Scope: Bridge')).toBeInTheDocument()
  })
})
