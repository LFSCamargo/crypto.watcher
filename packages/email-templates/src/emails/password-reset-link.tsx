import { PasswordResetEmail, type PasswordResetEmailProps } from '../templates/password-reset-email'

export default function PasswordResetLink(props: PasswordResetEmailProps) {
  return <PasswordResetEmail {...props} />
}

PasswordResetLink.PreviewProps = {
  resetUrl: 'https://crypto-watcher.local/reset-password?token=preview-token',
  expiresMinutes: 60,
} satisfies PasswordResetEmailProps
