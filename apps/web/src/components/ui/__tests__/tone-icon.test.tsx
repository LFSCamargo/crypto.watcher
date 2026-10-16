import { cleanup, render, screen } from '@testing-library/react'
import { RiBookOpenLine } from '@remixicon/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ToneIcon } from '../tone-icon'

describe('ToneIcon', () => {
  afterEach(cleanup)

  it('renders a decorative tile tinted with its palette tone', () => {
    render(<ToneIcon icon={RiBookOpenLine} tone="violet" data-testid="tile" />)
    const tile = screen.getByTestId('tile')
    expect(tile).toHaveAttribute('aria-hidden', 'true')
    expect(tile).toHaveClass('from-tone-violet/25', 'text-tone-violet-strong')
  })

  it('supports a larger size', () => {
    render(<ToneIcon icon={RiBookOpenLine} tone="teal" size="lg" data-testid="tile" />)
    expect(screen.getByTestId('tile')).toHaveClass('h-12', 'w-12')
  })
})
