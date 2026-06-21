import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { OtpPurpose } from '../otp-copy'
import { getOtpEmailCopy } from '../otp-copy'
import { EmailLayout } from '../components/email-layout'

export type OtpEmailProps = {
  code: string
  purpose: OtpPurpose
  expiresMinutes: number
}

export function OtpEmail({ code, purpose, expiresMinutes }: OtpEmailProps) {
  const copy = getOtpEmailCopy(purpose)

  return (
    <Html>
      <Head />
      <Preview>{copy.preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <EmailLayout>
            <Heading style={headingStyle}>{copy.heading}</Heading>
            <Text style={textStyle}>{copy.body}</Text>
            <Section style={codeBoxStyle}>
              <Text style={codeStyle}>{code}</Text>
            </Section>
            <Text style={mutedStyle}>This code expires in {expiresMinutes} minutes.</Text>
            <Text style={mutedStyle}>
              If you did not request this code, you can safely ignore this email.
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

const codeBoxStyle = {
  backgroundColor: '#fff8d6',
  border: '1px solid #f5d565',
  borderRadius: '12px',
  margin: '24px 0',
  padding: '16px',
  textAlign: 'center' as const,
} as const

const codeStyle = {
  color: '#111111',
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '8px',
  margin: 0,
} as const

const mutedStyle = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 12px',
} as const
