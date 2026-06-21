import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/render'
import { ProjectReviewFactors } from '../components/project-review-factors'
import { getCuratedProject } from '../lib/curated-projects'
import { getProjectReviewProfile } from '../lib/curated-project-reviews'

describe('ProjectReviewFactors', () => {
  it('renders strengths and risks from the review profile', () => {
    const profile = getProjectReviewProfile(getCuratedProject('bitcoin')!)

    renderWithProviders(<ProjectReviewFactors profile={profile} />)

    expect(screen.getByText("Why it's rated well")).toBeInTheDocument()
    expect(screen.getByText('Risks to understand')).toBeInTheDocument()
    expect(screen.getByText(profile.strengths[0]!)).toBeInTheDocument()
    expect(screen.getByText(profile.risks[0]!)).toBeInTheDocument()
  })
})
