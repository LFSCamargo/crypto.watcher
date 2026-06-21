import { describe, expect, it } from 'vitest'
import { renderOtpEmail } from '../render-otp-email'
import { renderPasswordResetEmail } from '../render-password-reset-email'

describe('renderOtpEmail', () => {
  it('renders html and text containing the OTP code', async () => {
    const message = await renderOtpEmail({
      code: '123456',
      purpose: 'verify_email',
      expiresMinutes: 10,
    })

    expect(message.subject).toContain('Verify your Crypto Watcher email')
    expect(message.html).toContain('123456')
    expect(message.text).toContain('123456')
    expect(message.text).toContain('10 minutes')
  })
})

describe('renderPasswordResetEmail', () => {
  it('renders html and text containing the reset link', async () => {
    const resetUrl = 'http://localhost:5173/auth/reset-password?token=abc123'
    const message = await renderPasswordResetEmail({
      resetUrl,
      expiresMinutes: 30,
    })

    expect(message.subject).toContain('Reset your Crypto Watcher password')
    expect(message.html).toContain(resetUrl)
    expect(message.text).toContain(resetUrl)
  })
})
