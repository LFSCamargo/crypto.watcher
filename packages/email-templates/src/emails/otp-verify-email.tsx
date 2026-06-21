import { OtpEmail, type OtpEmailProps } from '../templates/otp-email'

export default function OtpVerifyEmail(props: OtpEmailProps) {
  return <OtpEmail {...props} />
}

OtpVerifyEmail.PreviewProps = {
  code: '482913',
  purpose: 'verify_email',
  expiresMinutes: 10,
} satisfies OtpEmailProps
