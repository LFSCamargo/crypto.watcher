import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SignInPage } from '../pages/sign-in-page'
import { mockApi } from '../../../test/mock-api'
import { currentLocation, renderRoutes } from '../../../test/render-routes'

function renderSignIn(search = '') {
  return renderRoutes(
    [{ path: '/auth/signin', element: <SignInPage /> }],
    `/auth/signin${search}`,
  )
}

async function submit(email = 'ada@example.com', password = 'secret-password') {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Sign in' }))
}

describe('SignInPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    sessionStorage.clear()
  })

  it('shows an inline error for incorrect credentials', async () => {
    mockApi({ 'POST /auth/login': [401, { message: 'Invalid email or password' }] })
    renderSignIn()
    await submit()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email or password is incorrect.',
    )
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true')
  })

  it('explains network failures separately', async () => {
    mockApi({ 'POST /auth/login': [0] })
    renderSignIn()
    await submit()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /couldn.t reach Crypto Watcher/i,
    )
  })

  it('continues to code verification and keeps the intended destination', async () => {
    mockApi({ 'POST /auth/login': [200, { ok: true, email: 'ada@example.com' }] })
    renderSignIn('?next=%2Fapp%2Fgovernance')
    await submit()
    await waitFor(() => expect(currentLocation()).toBe('/auth/verify-otp'))
    expect(JSON.parse(sessionStorage.getItem('cw-pending-verification') ?? '{}')).toEqual(
      {
        email: 'ada@example.com',
        purpose: 'sign_in',
        next: '/app/governance',
      },
    )
  })

  it('carries the destination to the sign-up link', () => {
    renderSignIn('?next=%2Fapp%2Fanalysis-request')
    expect(screen.getByRole('link', { name: 'Create one' })).toHaveAttribute(
      'href',
      '/auth/signup?next=%2Fapp%2Fanalysis-request',
    )
  })

  it('ignores external destinations', () => {
    renderSignIn('?next=https%3A%2F%2Fevil.example')
    expect(screen.getByRole('link', { name: 'Create one' })).toHaveAttribute(
      'href',
      '/auth/signup',
    )
  })
})
