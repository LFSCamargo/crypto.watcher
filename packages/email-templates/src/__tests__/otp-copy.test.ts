import { describe, expect, it } from 'vitest'
import { getOtpEmailCopy } from '../otp-copy'

describe('getOtpEmailCopy', () => {
  it('returns verify-email copy', () => {
    expect(getOtpEmailCopy('verify_email')).toEqual({
      subject: 'Verify your Crypto Watcher email',
      preview: 'Use this code to verify your email address.',
      heading: 'Verify your email',
      body: 'Enter this one-time code to verify your email address for Crypto Watcher.',
    })
  })

  it('returns sign-in copy', () => {
    expect(getOtpEmailCopy('sign_in')).toEqual({
      subject: 'Your Crypto Watcher sign-in code',
      preview: 'Use this code to finish signing in.',
      heading: 'Sign in to Crypto Watcher',
      body: 'Enter this one-time code to complete your sign-in.',
    })
  })

  it('returns password-reset copy', () => {
    expect(getOtpEmailCopy('password_reset')).toEqual({
      subject: 'Your Crypto Watcher password reset code',
      preview: 'Use this code to reset your password.',
      heading: 'Reset your password',
      body: 'Enter this one-time code to reset your Crypto Watcher password.',
    })
  })
})
