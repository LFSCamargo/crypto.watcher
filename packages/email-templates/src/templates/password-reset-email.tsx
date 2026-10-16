import { Button, Heading, Text } from '@react-email/components'
import type { EmailBrandProps } from '../lib/brand'
import { EmailShell } from '../components/email-shell'

export type PasswordResetEmailProps = EmailBrandProps & {
  resetUrl: string
  expiresMinutes: number
}

export function PasswordResetEmail({ resetUrl, expiresMinutes, logoUrl }: PasswordResetEmailProps) {
  return (
    <EmailShell preview="Reset your Crypto Watcher password." logoUrl={logoUrl}>
      <Heading className="m-0 mb-4 text-2xl font-bold tracking-tight text-foreground">
        Reset your password
      </Heading>
      <Text className="m-0 mb-6 text-base leading-6 text-muted-foreground">
        We received a request to reset your Crypto Watcher password. Use the button below to choose
        a new password.
      </Text>
      <Button
        href={resetUrl}
        className="box-border rounded-full bg-primary px-6 py-3 text-center text-base font-bold text-primary-foreground no-underline"
      >
        Reset password
      </Button>
      <Text className="mb-0 mt-6 text-sm leading-5 text-muted-foreground">
        This link works once and expires in {expiresMinutes} minutes. If it has expired, request a
        new one from the sign-in page.
      </Text>
      <Text className="m-0 mt-3 text-sm leading-5 text-muted-foreground">
        If you did not request a password reset, you can safely ignore this email.
      </Text>
    </EmailShell>
  )
}
