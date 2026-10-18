import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../test/render'
import { CommandPalette } from '../command-palette'

describe('CommandPalette', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('opens beneath the header on small screens', () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('[]', { status: 200 })))
    renderWithProviders(<CommandPalette open onOpenChange={() => undefined} />)

    expect(screen.getByRole('dialog', { name: 'Search projects' })).toHaveClass(
      'max-md:top-[4.75rem]',
      'md:max-lg:top-24',
      'max-lg:translate-y-0',
    )
    expect(screen.getByRole('button', { name: 'Close search' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /USDC/ })).toBeInTheDocument()
  })
})
