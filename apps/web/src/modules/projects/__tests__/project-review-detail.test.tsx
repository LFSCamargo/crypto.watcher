import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/render'
import { ProjectReviewDetail } from '../components/project-review-detail'
import { getCuratedProject } from '../lib/curated-projects'
import { getProjectReviewProfile } from '../lib/curated-project-reviews'

describe('ProjectReviewDetail', () => {
  it('composes the full governor review sections', () => {
    const profile = getProjectReviewProfile(getCuratedProject('bitcoin')!)

    renderWithProviders(<ProjectReviewDetail profile={profile} />)

    expect(screen.getByText(profile.headline)).toBeInTheDocument()
    expect(screen.getByText("Why it's rated well")).toBeInTheDocument()
    expect(screen.getByText('External security reviews')).toBeInTheDocument()
    expect(screen.getByText('Governor council notes')).toBeInTheDocument()
  })
})
