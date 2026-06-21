import { render } from '@react-email/render'
import { PasswordResetEmail, type PasswordResetEmailProps } from './templates/password-reset-email'

export type RenderedEmail = {
  subject: string
  html: string
  text: string
}

const SUBJECT = 'Reset your Crypto Watcher password'

export async function renderPasswordResetEmail(
  props: PasswordResetEmailProps,
): Promise<RenderedEmail> {
  const html = await render(<PasswordResetEmail {...props} />)
  const text = [
    'Reset your password',
    '',
    'We received a request to reset your Crypto Watcher password.',
    `Open this link to choose a new password: ${props.resetUrl}`,
    '',
    `This link expires in ${props.expiresMinutes} minutes.`,
  ].join('\n')

  return { subject: SUBJECT, html, text }
}
