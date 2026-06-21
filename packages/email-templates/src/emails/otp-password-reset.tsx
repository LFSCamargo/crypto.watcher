import { OtpEmail, type OtpEmailProps } from '../templates/otp-email'

export default function OtpPasswordReset(props: OtpEmailProps) {
  return <OtpEmail {...props} />
}

OtpPasswordReset.PreviewProps = {
  code: '739204',
  purpose: 'password_reset',
  expiresMinutes: 10,
} satisfies OtpEmailProps
