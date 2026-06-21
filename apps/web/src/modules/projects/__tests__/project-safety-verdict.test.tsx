import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/render'
import { ProjectSafetyVerdict } from '../components/project-safety-verdict'
import { getCuratedProject } from '../lib/curated-projects'
import { getProjectReviewProfile } from '../lib/curated-project-reviews'

describe('ProjectSafetyVerdict', () => {
  it('renders a low-risk bitcoin review profile', () => {
    const project = getCuratedProject('bitcoin')
    const profile = getProjectReviewProfile(project!)

    renderWithProviders(<ProjectSafetyVerdict profile={profile} />)

    expect(screen.getByText('Low risk')).toBeInTheDocument()
    expect(screen.getByText(profile.headline)).toBeInTheDocument()
    expect(screen.getByText(profile.summary)).toBeInTheDocument()
  })

  it('renders a caution verdict for watch-status projects', () => {
    const project = getCuratedProject('xrp')
    const profile = getProjectReviewProfile(project!)

    renderWithProviders(<ProjectSafetyVerdict profile={profile} />)

    expect(screen.getByText('Under watch')).toBeInTheDocument()
  })

  it('renders moderate and elevated risk verdict labels', () => {
    const moderate = getProjectReviewProfile(getCuratedProject('solana')!)
    const elevated = getProjectReviewProfile(getCuratedProject('tether')!)

    renderWithProviders(<ProjectSafetyVerdict profile={moderate} />)
    expect(screen.getByText('Moderate risk')).toBeInTheDocument()

    renderWithProviders(<ProjectSafetyVerdict profile={elevated} />)
    expect(screen.getByText('Elevated risk')).toBeInTheDocument()
  })
})
