import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthShell } from '../components/auth-shell'
import { renderWithProviders } from '../../../test/render'

describe('AuthShell', () => {
  it('renders the page title, purpose and a glass form panel', () => {
    renderWithProviders(
      <AuthShell title="Sign in" subtitle="Access your profile.">
        <p>form</p>
      </AuthShell>,
    )
    const heading = screen.getByRole('heading', { level: 1, name: 'Sign in' })
    expect(heading.closest('.glass-panel')).not.toBeNull()
    expect(screen.getByText('Access your profile.')).toBeInTheDocument()
  })

  it('makes no unsupported volume or community-scoring claims', () => {
    const { container } = renderWithProviders(
      <AuthShell title="Sign in" subtitle="x">
        <p>form</p>
      </AuthShell>,
    )
    expect(container.textContent).not.toMatch(/100\+|community-driven/i)
    expect(container.textContent).toMatch(/vetted governor council/i)
  })
})
