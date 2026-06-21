import { beforeEach, describe, expect, it, vi } from 'vitest'

const { sendMail, createTransport } = vi.hoisted(() => {
  const sendMail = vi.fn().mockResolvedValue({ messageId: 'test-id' })
  const createTransport = vi.fn(() => ({ sendMail }))
  return { sendMail, createTransport }
})

vi.mock('nodemailer', () => ({
  default: { createTransport },
}))

vi.mock('email-templates', () => ({
  renderOtpEmail: vi.fn().mockResolvedValue({
    subject: 'OTP subject',
    html: '<p>123456</p>',
    text: '123456',
  }),
  renderPasswordResetEmail: vi.fn().mockResolvedValue({
    subject: 'Reset subject',
    html: '<p>reset</p>',
    text: 'reset',
  }),
}))

import { renderOtpEmail, renderPasswordResetEmail } from 'email-templates'
import { mailService } from '../mail.service'

describe('mailService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends OTP emails through nodemailer', async () => {
    await mailService.sendOtpEmail({
      to: 'user@example.com',
      code: '123456',
      purpose: 'verify_email',
      expiresMinutes: 10,
    })

    expect(renderOtpEmail).toHaveBeenCalledWith({
      code: '123456',
      purpose: 'verify_email',
      expiresMinutes: 10,
    })
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'OTP subject',
        html: '<p>123456</p>',
        text: '123456',
      }),
    )
  })

  it('sends password reset emails through nodemailer', async () => {
    await mailService.sendPasswordResetEmail({
      to: 'user@example.com',
      resetUrl: 'http://localhost:5173/auth/reset-password?token=abc',
      expiresMinutes: 30,
    })

    expect(renderPasswordResetEmail).toHaveBeenCalledWith({
      resetUrl: 'http://localhost:5173/auth/reset-password?token=abc',
      expiresMinutes: 30,
    })
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Reset subject',
      }),
    )
  })
})
