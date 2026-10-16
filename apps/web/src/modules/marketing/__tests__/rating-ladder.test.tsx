import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { RatingLadder } from '../components/rating-ladder'
import { curatedProjects } from '../../projects/lib/curated-projects'
import { resolveCreditRatingFromSafetyScore } from '../../../lib/ratings/credit-rating'
import { renderWithProviders } from '../../../test/render'

const countFor = (grade: string, category?: string) =>
  curatedProjects.filter(
    (project) =>
      resolveCreditRatingFromSafetyScore(project.score).sp === grade &&
      (!category || project.category === category),
  ).length

describe('RatingLadder', () => {
  afterEach(cleanup)

  it('charts how many reference assets sit at each grade', () => {
    renderWithProviders(<RatingLadder />)
    const chart = screen.getByRole('group', { name: 'Reference assets by grade' })
    expect(
      within(chart).getByRole('button', { name: `BBB: ${countFor('BBB')} assets` }),
    ).toBeInTheDocument()
    expect(
      within(chart).getByRole('button', { name: `AAA: ${countFor('AAA')} assets` }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByText(`Investment grade · ${countFor('AAA')} asset · scores 97–100`),
    ).toBeInTheDocument()
  })

  it('lists the assets of a chosen grade with links to their assessments', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RatingLadder />)

    await user.click(screen.getByRole('button', { name: /^BB: / }))
    const list = screen.getByRole('list', { name: /BB assets/ })
    const links = within(list).getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link.getAttribute('href')).toMatch(/^\/app\/reference\//)
      expect(link).toHaveAccessibleName(/reference assessment/)
    }
  })

  it('re-shapes the ladder for a category', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RatingLadder />)

    await user.click(screen.getByRole('button', { name: /^DeFi/ }))
    expect(screen.getByRole('button', { name: /^DeFi/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      screen.getByRole('button', { name: `BBB: ${countFor('BBB', 'defi')} assets` }),
    ).toBeInTheDocument()
    const list = screen.getByRole('list', { name: /assets$/ })
    for (const link of within(list).getAllByRole('link')) {
      expect(link.textContent).toMatch(/DeFi/)
    }
  })

  it('opens the radar-style preview when a listed coin is hovered', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RatingLadder />)

    await user.hover(screen.getByRole('link', { name: 'USDC reference assessment' }))

    expect(await screen.findByRole('heading', { name: 'USDC' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Reference index' })).toHaveTextContent('97')
    expect(
      screen.getByText('Click the coin to open the full assessment'),
    ).toBeInTheDocument()
  })
})
