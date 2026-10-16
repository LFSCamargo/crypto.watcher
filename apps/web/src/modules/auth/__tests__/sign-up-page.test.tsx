import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SignUpPage } from '../pages/sign-up-page'
import { mockApi } from '../../../test/mock-api'
import { currentLocation, renderRoutes } from '../../../test/render-routes'

const STRONG = 'Correct-Horse-42!'

async function fillForm(email: string, confirm = STRONG) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password', { exact: true }), STRONG)
  await user.type(screen.getByLabelText('Confirm password'), confirm)
  await user.click(screen.getByRole('button', { name: 'Create account' }))
}

describe('SignUpPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    sessionStorage.clear()
  })

  it('offers sign-in when the email is already registered', async () => {
    mockApi({ 'POST /auth/register': [409, { message: 'Email already registered' }] })
    renderRoutes([{ path: '/auth/signup', element: <SignUpPage /> }], '/auth/signup')
    await fillForm('taken@example.com')
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('An account with this email already exists.')
    expect(within(alert).getByRole('link', { name: 'Sign in instead' })).toHaveAttribute(
      'href',
      '/auth/signin',
    )
  })

  it('reports mismatched passwords inline without calling the API', async () => {
    const fetchMock = mockApi({})
    renderRoutes([{ path: '/auth/signup', element: <SignUpPage /> }], '/auth/signup')
    await fillForm('ada@example.com', 'Different-Horse-42!')
    expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match.')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('moves to email verification with the intended destination', async () => {
    mockApi({ 'POST /auth/register': [201, { ok: true, email: 'ada@example.com' }] })
    renderRoutes(
      [{ path: '/auth/signup', element: <SignUpPage /> }],
      '/auth/signup?next=%2Fapp%2Fanalysis-request',
    )
    await fillForm('ada@example.com')
    await waitFor(() => expect(currentLocation()).toBe('/auth/verify-otp'))
    expect(
      JSON.parse(sessionStorage.getItem('cw-pending-verification') ?? '{}'),
    ).toMatchObject({
      purpose: 'verify_email',
      next: '/app/analysis-request',
    })
  })
})
