import { describe, expect, it } from 'vitest'
import { DEFAULT_EMAIL_LOGO_URL } from '../lib/brand'
import { renderOtpEmail } from '../render-otp-email'
import { renderPasswordResetEmail } from '../render-password-reset-email'

describe('renderOtpEmail', () => {
  it('renders html and text containing the OTP code', async () => {
    const message = await renderOtpEmail({
      code: '123456',
      purpose: 'verify_email',
      expiresMinutes: 10,
      logoUrl: DEFAULT_EMAIL_LOGO_URL,
    })

    expect(message.subject).toContain('Verify your Crypto Watcher email')
    expect(message.html).toContain('123456')
    expect(message.text).toContain('123456')
    expect(message.text).toContain('10 minutes')
    expect(message.text.replace(/\s+/g, ' ')).toContain(
      'Requesting a new code makes earlier codes stop working.',
    )
    expect(message.html).toContain('Crypto')
    expect(message.html).toContain('Watcher')
    expect(message.html).toContain(DEFAULT_EMAIL_LOGO_URL)
    expect(message.html).toContain('rgb(0,0,0)')
    expect(message.html).toContain('rgb(255,214,51)')
  })
})

describe('renderPasswordResetEmail', () => {
  it('renders html and text containing the reset link', async () => {
    const resetUrl = 'http://localhost:5173/auth/reset-password?token=abc123'
    const message = await renderPasswordResetEmail({
      resetUrl,
      expiresMinutes: 30,
      logoUrl: DEFAULT_EMAIL_LOGO_URL,
    })

    expect(message.subject).toContain('Reset your Crypto Watcher password')
    expect(message.html).toContain(resetUrl)
    expect(message.text).toContain(resetUrl)
    const text = message.text.replace(/\s+/g, ' ')
    expect(text).toContain('This link works once and expires in 30 minutes.')
    expect(text).toContain('request a new one from the sign-in page')
  })
})
