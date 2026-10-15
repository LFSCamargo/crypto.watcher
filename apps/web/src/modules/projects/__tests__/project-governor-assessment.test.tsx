import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/render'
import { ProjectGovernorAssessment } from '../components/project-governor-assessment'
import { getCuratedProject } from '../lib/curated-projects'
import { getProjectReviewProfile } from '../lib/curated-project-reviews'

describe('ProjectGovernorAssessment', () => {
  it('presents curated notes as analyst notes, not a council report', () => {
    const profile = getProjectReviewProfile(getCuratedProject('ethereum')!)

    renderWithProviders(<ProjectGovernorAssessment profile={profile} />)

    expect(screen.getByText('Analyst notes')).toBeInTheDocument()
    expect(screen.getByText(profile.governorNotes)).toBeInTheDocument()
    expect(screen.getByText(/not a governor council report/i)).toBeInTheDocument()
    expect(
      screen.queryByText(/Reviewed by Crypto Watcher Governor Council/i),
    ).not.toBeInTheDocument()
  })
})
