import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VerifyOtpPage } from '../pages/verify-otp-page'

const verifyMutateAsync = vi.fn()
const resendMutateAsync = vi.fn()

vi.mock('../hooks/use-session', () => ({
  useVerifyEmailOtp: () => ({
    mutateAsync: verifyMutateAsync,
    isPending: false,
  }),
  useResendEmailOtp: () => ({
    mutateAsync: resendMutateAsync,
    isPending: false,
  }),
}))

describe('VerifyOtpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('prompts for a code when email state is present', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/auth/verify-otp', state: { email: 'user@example.com' } }]}>
        <VerifyOtpPage />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText(/one-time code/i)).toBeInTheDocument()
    expect(screen.getByText(/user@example.com/i)).toBeInTheDocument()
  })

  it('submits the OTP code for verification', async () => {
    verifyMutateAsync.mockResolvedValue({ publicKey: null })
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={[{ pathname: '/auth/verify-otp', state: { email: 'user@example.com' } }]}>
        <VerifyOtpPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/one-time code/i), '123456')
    await user.click(screen.getByRole('button', { name: /verify and continue/i }))

    expect(verifyMutateAsync).toHaveBeenCalledWith({ email: 'user@example.com', code: '123456' })
  })
})
