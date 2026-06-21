export type OtpPurpose = 'verify_email' | 'password_reset'

export type OtpEmailCopy = {
  subject: string
  preview: string
  heading: string
  body: string
}

export function getOtpEmailCopy(purpose: OtpPurpose): OtpEmailCopy {
  if (purpose === 'password_reset') {
    return {
      subject: 'Your Crypto Watcher password reset code',
      preview: 'Use this code to reset your password.',
      heading: 'Reset your password',
      body: 'Enter this one-time code to reset your Crypto Watcher password.',
    }
  }

  return {
    subject: 'Verify your Crypto Watcher email',
    preview: 'Use this code to verify your email address.',
    heading: 'Verify your email',
    body: 'Enter this one-time code to verify your email address for Crypto Watcher.',
  }
}
