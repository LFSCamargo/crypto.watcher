import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import { EmailLayout } from '../components/email-layout'

export type PasswordResetEmailProps = {
  resetUrl: string
  expiresMinutes: number
}

export function PasswordResetEmail({ resetUrl, expiresMinutes }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Crypto Watcher password.</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <EmailLayout>
            <Heading style={headingStyle}>Reset your password</Heading>
            <Text style={textStyle}>
              We received a request to reset your Crypto Watcher password. Use the button below to
              choose a new password.
            </Text>
            <Button href={resetUrl} style={buttonStyle}>
              Reset password
            </Button>
            <Text style={mutedStyle}>This link expires in {expiresMinutes} minutes.</Text>
            <Text style={mutedStyle}>
              If you did not request a password reset, you can safely ignore this email.
            </Text>
          </EmailLayout>
        </Container>
      </Body>
    </Html>
  )
}

const bodyStyle = {
  backgroundColor: '#f7f3ea',
  fontFamily: 'Helvetica, Arial, sans-serif',
} as const

const containerStyle = {
  margin: '0 auto',
  padding: '24px 0',
  maxWidth: '560px',
} as const

const headingStyle = {
  color: '#111111',
  fontSize: '24px',
  fontWeight: 700,
  margin: '0 0 16px',
} as const

const textStyle = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
} as const

const buttonStyle = {
  backgroundColor: '#f5c518',
  borderRadius: '999px',
  color: '#111111',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 700,
  padding: '12px 24px',
  textDecoration: 'none',
} as const

const mutedStyle = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0 0',
} as const
