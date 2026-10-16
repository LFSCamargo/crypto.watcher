import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { MethodologySection } from '../components/methodology-section'

describe('MethodologySection', () => {
  afterEach(cleanup)

  it('shows the four principles as headings', () => {
    render(<MethodologySection />)
    for (const title of [
      'Vetted governor council',
      'Every score shows its working',
      'Money can’t move a score',
      'Anyone can bring evidence',
    ]) {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    }
  })

  it('lets visitors try to buy a better score and keeps it unchanged', async () => {
    const user = userEvent.setup()
    render(<MethodologySection />)
    const card = screen.getByRole('article', { name: 'Money can’t move a score' })
    const button = within(card).getByRole('button', { name: /Try to buy a better score/ })

    await user.click(button)
    expect(within(card).getByRole('status')).toHaveTextContent(
      'Score unchanged at 82. Holding CWT never moves a rating.',
    )
    await user.click(button)
    await user.click(button)
    expect(within(card).getByRole('status')).toHaveTextContent(/Still 82 after 3 tries/)
    expect(within(card).getByText('82', { selector: '[data-score]' })).toBeInTheDocument()
  })
})
