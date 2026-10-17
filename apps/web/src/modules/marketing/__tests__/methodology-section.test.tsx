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

  it('explains what each review seat checks', () => {
    render(<MethodologySection />)
    const card = screen.getByRole('article', { name: 'Vetted governor council' })

    expect(within(card).getAllByRole('listitem')).toHaveLength(6)
    expect(within(card).getByText('Smart contract security')).toBeInTheDocument()
    expect(within(card).getByText(/upgrade keys, admin powers, and audits/i)).toBeInTheDocument()
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
    expect(card.querySelector('[data-score-dial]')).toBeTruthy()
    expect(card.querySelectorAll('[data-coin]')).toHaveLength(3)
    expect(card.querySelector('[data-score]')?.className).not.toMatch(/shake/)
  })
})
