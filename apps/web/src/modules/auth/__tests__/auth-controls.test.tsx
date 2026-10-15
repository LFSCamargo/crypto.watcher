import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthControls } from '../components/auth-controls'
import { renderWithProviders } from '../../../test/render'

describe('AuthControls', () => {
  it('returns guests to the page they were on after signing in', () => {
    renderWithProviders(<AuthControls />, { route: '/app/governance?tab=active' })
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/auth/signin?next=%2Fapp%2Fgovernance%3Ftab%3Dactive',
    )
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute(
      'href',
      '/auth/signup?next=%2Fapp%2Fgovernance%3Ftab%3Dactive',
    )
  })

  it('uses plain auth links on the home page', () => {
    renderWithProviders(<AuthControls />, { route: '/' })
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/auth/signin',
    )
  })

  it('does not nest auth pages as destinations', () => {
    renderWithProviders(<AuthControls />, { route: '/auth/forgot-password' })
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute(
      'href',
      '/auth/signup',
    )
  })
})
