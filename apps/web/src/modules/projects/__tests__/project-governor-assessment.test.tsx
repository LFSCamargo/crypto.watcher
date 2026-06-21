import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/render'
import { ProjectGovernorAssessment } from '../components/project-governor-assessment'
import { getCuratedProject } from '../lib/curated-projects'
import { getProjectReviewProfile } from '../lib/curated-project-reviews'

describe('ProjectGovernorAssessment', () => {
  it('renders governor council notes', () => {
    const profile = getProjectReviewProfile(getCuratedProject('ethereum')!)

    renderWithProviders(<ProjectGovernorAssessment profile={profile} />)

    expect(screen.getByText('Governor council notes')).toBeInTheDocument()
    expect(screen.getByText(profile.governorNotes)).toBeInTheDocument()
    expect(screen.getByText(/Crypto Watcher Governor Council/i)).toBeInTheDocument()
  })
})
