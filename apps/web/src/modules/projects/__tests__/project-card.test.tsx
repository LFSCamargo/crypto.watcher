import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/render'
import { ProjectCard } from '../components/project-card'

const project = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'uniswap-v3',
  name: 'Uniswap V3',
  description: 'Automated market maker',
  chainId: 1,
  tokenAddress: null,
  state: 'in_analysis' as const,
  votingContractAddress: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  score: 82,
}

describe('ProjectCard', () => {
  it('renders project metadata and lifecycle label', () => {
    renderWithProviders(<ProjectCard project={project} />)

    expect(screen.getByRole('heading', { name: 'Uniswap V3' })).toBeInTheDocument()
    expect(screen.getByText('In analysis')).toBeInTheDocument()
    expect(screen.getByText('82')).toBeInTheDocument()
    expect(screen.getByText('Automated market maker')).toBeInTheDocument()
  })

  it('shows a placeholder when no score exists', () => {
    renderWithProviders(<ProjectCard project={{ ...project, score: undefined }} />)

    expect(screen.getByText('No score yet')).toBeInTheDocument()
  })

  it('maps lifecycle states to badge variants', () => {
    const states = [
      { state: 'voting' as const, label: 'Voting' },
      { state: 'ready' as const, label: 'Ready for voting' },
      { state: 'closed' as const, label: 'Voting closed' },
      { state: 'analyzed' as const, label: 'Analyzed' },
    ]

    for (const { state, label } of states) {
      const { unmount } = renderWithProviders(
        <ProjectCard project={{ ...project, state, description: undefined }} />,
      )
      expect(screen.getByText(label)).toBeInTheDocument()
      unmount()
    }
  })
})
