import { cleanup, render, screen, within } from '@testing-library/react'
import { RiStackLine } from '@remixicon/react'
import { afterEach, describe, expect, it } from 'vitest'
import { PageHero } from '../page-hero'

describe('PageHero', () => {
  afterEach(cleanup)

  it('renders the page heading, eyebrow, actions and stats', () => {
    render(
      <PageHero
        icon={RiStackLine}
        tone="sky"
        eyebrow="Project catalog"
        title="Browse projects"
        description="Scores from the council."
        actions={<button type="button">Request a review</button>}
        stats={[
          { label: 'Council projects', value: '4' },
          { label: 'Reference assessments', value: '100' },
        ]}
      />,
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Browse projects' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Project catalog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Request a review' })).toBeInTheDocument()
    const stats = screen.getByRole('list', { name: 'Browse projects at a glance' })
    expect(within(stats).getByText('100')).toBeInTheDocument()
  })

  it('shows a status pill when provided', () => {
    render(<PageHero icon={RiStackLine} title="Governance" status="Pre-launch" />)
    expect(screen.getByText('Pre-launch')).toBeInTheDocument()
  })
})
