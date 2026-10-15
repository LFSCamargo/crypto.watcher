import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ForgotPasswordPage } from '../pages/forgot-password-page'
import { ResetPasswordPage } from '../pages/reset-password-page'
import { mockApi } from '../../../test/mock-api'
import { currentLocation, renderRoutes } from '../../../test/render-routes'

const STRONG = 'Correct-Horse-42!'

describe('ForgotPasswordPage', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('confirms without revealing whether the account exists', async () => {
    mockApi({ 'POST /auth/forgot-password': [200, { ok: true }] })
    renderRoutes(
      [{ path: '/auth/forgot-password', element: <ForgotPasswordPage /> }],
      '/auth/forgot-password',
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))
    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent('If an account exists for ada@example.com')
    expect(status).toHaveTextContent('expires in 30 minutes')
  })

  it('keeps the form and explains network failures', async () => {
    mockApi({ 'POST /auth/forgot-password': [0] })
    renderRoutes(
      [{ path: '/auth/forgot-password', element: <ForgotPasswordPage /> }],
      '/auth/forgot-password',
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /couldn.t reach Crypto Watcher/i,
    )
    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com')
  })
})

describe('ResetPasswordPage', () => {
  afterEach(() => vi.unstubAllGlobals())

  function renderReset(search: string) {
    return renderRoutes(
      [{ path: '/auth/reset-password', element: <ResetPasswordPage /> }],
      `/auth/reset-password${search}`,
    )
  }

  async function choosePassword(confirm = STRONG) {
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('New password', { exact: true }), STRONG)
    await user.type(screen.getByLabelText('Confirm password'), confirm)
    await user.click(screen.getByRole('button', { name: 'Update password' }))
  }

  it('explains a link without a token', () => {
    renderReset('')
    expect(screen.getByRole('alert')).toHaveTextContent('This reset link is incomplete.')
    expect(screen.getByRole('link', { name: 'Request a new link' })).toHaveAttribute(
      'href',
      '/auth/forgot-password',
    )
  })

  it('explains an expired link and offers a new one', async () => {
    mockApi({
      'POST /auth/reset-password': [400, { message: 'Invalid or expired reset token' }],
    })
    renderReset('?token=old')
    await choosePassword()
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('This reset link is invalid or has expired.')
    expect(
      within(alert).getByRole('link', { name: 'Request a new link' }),
    ).toBeInTheDocument()
  })

  it('reports mismatched passwords inline', async () => {
    const fetchMock = mockApi({})
    renderReset('?token=abc')
    await choosePassword('Something-Else-42!')
    expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match.')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns to sign in after a successful reset', async () => {
    mockApi({ 'POST /auth/reset-password': [200, { ok: true }] })
    renderReset('?token=abc')
    await choosePassword()
    await waitFor(() => expect(currentLocation()).toBe('/auth/signin?reset=1'))
  })
})
