import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { Disclosure } from '../disclosure'

describe('Disclosure', () => {
  afterEach(cleanup)

  it('starts collapsed with its content inert and expands on click', async () => {
    const user = userEvent.setup()
    render(<Disclosure title="What do states mean?">Answer text</Disclosure>)
    const toggle = screen.getByRole('button', { name: 'What do states mean?' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    const panel = screen.getByText('Answer text').closest('[data-state]')
    expect(panel).toHaveAttribute('data-state', 'closed')
    expect(panel).toHaveAttribute('inert')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(panel).toHaveAttribute('data-state', 'open')
    expect(panel).not.toHaveAttribute('inert')
    expect(screen.getByRole('region', { name: 'What do states mean?' })).toBe(panel)
  })

  it('can start open and wraps the toggle in a heading', () => {
    render(
      <Disclosure title="Question" headingLevel={3} defaultOpen>
        Answer
      </Disclosure>,
    )
    expect(
      screen.getByRole('heading', { level: 3, name: 'Question' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Question' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})
