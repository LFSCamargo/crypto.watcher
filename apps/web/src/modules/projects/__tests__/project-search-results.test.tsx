import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectSearchResults } from '../components/project-search-results'

const stellarResult = {
  key: 'ref-stellar',
  title: 'Stellar',
  subtitle: 'XLM · Layer 1',
  symbol: 'XLM',
  slug: 'stellar',
  kind: 'reference' as const,
  to: '/app/reference/stellar',
}

describe('ProjectSearchResults', () => {
  it('prompts the user when the query is empty', () => {
    render(
      <ProjectSearchResults
        results={[]}
        query=""
        activeIndex={-1}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />,
    )

    expect(screen.getByText(/Type to search 100\+ reviewed projects/i)).toBeInTheDocument()
  })

  it('shows curated matches and handles selection', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <ProjectSearchResults
        results={[stellarResult]}
        query="stellar"
        activeIndex={0}
        onSelect={onSelect}
        onHover={vi.fn()}
      />,
    )

    expect(screen.getByText('Stellar')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Stellar/i }))
    expect(onSelect).toHaveBeenCalledWith('/app/reference/stellar')
  })

  it('shows an empty state when nothing matches', () => {
    render(
      <ProjectSearchResults
        results={[]}
        query="zzzz-no-match"
        activeIndex={-1}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />,
    )

    expect(screen.getByText(/No projects found for/i)).toBeInTheDocument()
  })
})
