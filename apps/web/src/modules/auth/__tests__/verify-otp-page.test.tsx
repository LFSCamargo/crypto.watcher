import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { VerifyOtpPage } from '../pages/verify-otp-page'
import { mockApi } from '../../../test/mock-api'
import { currentLocation, renderRoutes } from '../../../test/render-routes'
import { useSession } from '../../../store/session'

const member = {
  id: 'u1',
  email: 'ada@example.com',
  nickname: 'ada',
  role: 'user' as const,
}

function pending(value: { email: string; purpose: string; next?: string }) {
  sessionStorage.setItem('cw-pending-verification', JSON.stringify(value))
}

function renderVerify() {
  return renderRoutes(
    [{ path: '/auth/verify-otp', element: <VerifyOtpPage /> }],
    '/auth/verify-otp',
  )
}

async function enterCode(code = '123456') {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  await user.type(screen.getByLabelText('One-time code'), code)
  await user.click(screen.getByRole('button', { name: /Verify and continue/ }))
  return user
}

describe('VerifyOtpPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    sessionStorage.clear()
    useSession.setState({ user: undefined })
  })

  it('asks people to start over when there is nothing to verify', () => {
    renderVerify()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Verification required',
    )
    expect(screen.getByRole('link', { name: 'Back to sign in' })).toHaveAttribute(
      'href',
      '/auth/signin',
    )
  })

  it('matches the email heading for each purpose and survives a reload', () => {
    pending({ email: 'ada@example.com', purpose: 'sign_in' })
    const { unmount } = renderVerify()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Sign in to Crypto Watcher',
    )
    expect(screen.getByText(/expires in 10 minutes/)).toBeInTheDocument()
    unmount()

    pending({ email: 'new@example.com', purpose: 'verify_email' })
    renderVerify()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Verify your email',
    )
    expect(screen.getByText(/new@example.com/)).toBeInTheDocument()
  })

  it('explains invalid or expired codes inline', async () => {
    mockApi({
      'POST /auth/verify-email-otp': [400, { message: 'Invalid or expired code' }],
    })
    pending({ email: 'ada@example.com', purpose: 'sign_in' })
    renderVerify()
    await enterCode()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That code is incorrect or has expired.',
    )
    expect(screen.getByLabelText('One-time code')).toHaveAttribute('aria-invalid', 'true')
  })

  it('starts a cooldown after resending a code', async () => {
    const fetchMock = mockApi({ 'POST /auth/resend-email-otp': [200, { ok: true }] })
    pending({ email: 'ada@example.com', purpose: 'sign_in' })
    renderVerify()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    await user.click(screen.getByRole('button', { name: 'Resend code' }))

    const cooling = await screen.findByRole('button', { name: /Resend code in 30s/ })
    expect(cooling).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('A new code is on its way')

    act(() => vi.advanceTimersByTime(30_000))
    expect(screen.getByRole('button', { name: 'Resend code' })).toBeEnabled()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('returns signed-in users to their intended destination', async () => {
    mockApi({ 'POST /auth/verify-email-otp': [200, { user: member }] })
    pending({ email: 'ada@example.com', purpose: 'sign_in', next: '/app/governance' })
    renderVerify()
    await enterCode()
    await waitFor(() => expect(currentLocation()).toBe('/app/governance'))
    expect(sessionStorage.getItem('cw-pending-verification')).toBeNull()
  })

  it('sends new accounts through onboarding with the destination preserved', async () => {
    mockApi({ 'POST /auth/verify-email-otp': [200, { user: member }] })
    pending({
      email: 'ada@example.com',
      purpose: 'verify_email',
      next: '/app/analysis-request',
    })
    renderVerify()
    await enterCode()
    await waitFor(() =>
      expect(currentLocation()).toBe('/auth/onboarding?next=%2Fapp%2Fanalysis-request'),
    )
  })

  it('never follows an external destination', async () => {
    mockApi({ 'POST /auth/verify-email-otp': [200, { user: member }] })
    pending({
      email: 'ada@example.com',
      purpose: 'sign_in',
      next: '//evil.example/steal',
    })
    renderVerify()
    await enterCode()
    await waitFor(() => expect(currentLocation()).toBe('/app'))
  })
})
