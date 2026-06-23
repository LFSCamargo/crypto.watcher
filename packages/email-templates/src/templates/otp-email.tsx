import { Heading, Section, Text } from '@react-email/components'
import type { EmailBrandProps } from '../lib/brand'
import type { OtpPurpose } from '../otp-copy'
import { getOtpEmailCopy } from '../otp-copy'
import { EmailShell } from '../components/email-shell'

export type OtpEmailProps = EmailBrandProps & {
  code: string
  purpose: OtpPurpose
  expiresMinutes: number
}

export function OtpEmail({ code, purpose, expiresMinutes, logoUrl }: OtpEmailProps) {
  const copy = getOtpEmailCopy(purpose)

  return (
    <EmailShell preview={copy.preview} logoUrl={logoUrl}>
      <Heading className="m-0 mb-4 text-2xl font-bold tracking-tight text-foreground">
        {copy.heading}
      </Heading>
      <Text className="m-0 mb-4 text-base leading-6 text-muted-foreground">
        {copy.body}
      </Text>
      <Section className="my-6 rounded-xl border border-solid border-primary bg-secondary px-4 py-4 text-center">
        <Text className="m-0 text-[32px] font-extrabold tracking-[8px] text-foreground">
          {code}
        </Text>
      </Section>
      <Text className="m-0 mb-3 text-sm leading-5 text-muted-foreground">
        This code expires in {expiresMinutes} minutes.
      </Text>
      <Text className="m-0 text-sm leading-5 text-muted-foreground">
        If you did not request this code, you can safely ignore this email.
      </Text>
    </EmailShell>
  )
}
