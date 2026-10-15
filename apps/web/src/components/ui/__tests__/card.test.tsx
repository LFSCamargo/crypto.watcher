import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Card } from '../card'

describe('Card', () => {
  it('renders an opaque surface by default', () => {
    render(<Card>Body</Card>)
    const card = screen.getByText('Body')
    expect(card).toHaveClass('bg-card')
    expect(card).not.toHaveClass('glass-card')
  })

  it('supports blurred and flat glass variants', () => {
    render(
      <>
        <Card variant="glass">Glass</Card>
        <Card variant="glass-flat">Flat</Card>
      </>,
    )
    expect(screen.getByText('Glass')).toHaveClass('glass-card')
    expect(screen.getByText('Flat')).toHaveClass('glass-card-flat')
    expect(screen.getByText('Flat')).not.toHaveClass('bg-card')
  })
})
