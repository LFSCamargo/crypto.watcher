import { describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ProjectIcon } from '../project-icon'

describe('ProjectIcon', () => {
  it('renders a local icon for curated slugs', () => {
    render(<ProjectIcon symbol="BTC" name="Bitcoin" slug="bitcoin" />)

    const image = screen.getByRole('img', { name: 'Bitcoin' })
    expect(image).toHaveAttribute('src', '/icons/bitcoin.png')
  })

  it('puts dark transparent logos such as Aptos on a white backdrop', () => {
    render(<ProjectIcon symbol="APT" name="Aptos" slug="aptos" />)
    expect(screen.getByRole('img', { name: 'Aptos' })).toHaveClass('bg-white')
    cleanup()
    render(<ProjectIcon symbol="BTC" name="Bitcoin" slug="bitcoin" />)
    expect(screen.getByRole('img', { name: 'Bitcoin' })).not.toHaveClass('bg-white')
  })

  it('falls back to initials when the image fails to load', () => {
    render(<ProjectIcon symbol="BTC" name="Bitcoin" slug="bitcoin" />)

    fireEvent.error(screen.getByRole('img', { name: 'Bitcoin' }))

    expect(screen.getByLabelText('Bitcoin')).toHaveTextContent('BTC')
  })

  it('renders initials when no icon source is available', () => {
    render(<ProjectIcon symbol="ABC" name="Alpha Beta" />)

    expect(screen.getByLabelText('Alpha Beta')).toHaveTextContent('ABC')
  })

  it('prefers an explicit src over the curated slug', () => {
    render(<ProjectIcon symbol="ETH" name="Ethereum" slug="ethereum" src="/custom.png" />)

    expect(screen.getByRole('img', { name: 'Ethereum' })).toHaveAttribute(
      'src',
      '/custom.png',
    )
  })
})
