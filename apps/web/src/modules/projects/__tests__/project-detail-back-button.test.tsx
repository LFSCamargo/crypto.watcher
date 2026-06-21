import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/render'
import { ProjectDetailBackButton } from '../components/project-detail-back-button'

describe('ProjectDetailBackButton', () => {
  it('links back to the projects list by default', () => {
    renderWithProviders(<ProjectDetailBackButton />)

    const link = screen.getByRole('link', { name: /Back to projects/i })
    expect(link).toHaveAttribute('href', '/app')
  })

  it('supports custom label and destination', () => {
    renderWithProviders(<ProjectDetailBackButton label="Back to search" to="/app/search" />)

    const link = screen.getByRole('link', { name: /Back to search/i })
    expect(link).toHaveAttribute('href', '/app/search')
  })
})
