import {
  Body,
  Column,
  Container,
  Font,
  Head,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'
import type { ReactNode } from 'react'
import { resolveLogoUrl, type EmailBrandProps } from '../lib/brand'
import { emailTailwindConfig } from '../lib/tailwind-config'

type EmailShellProps = EmailBrandProps & {
  preview: string
  children: ReactNode
}

export function EmailBrandHeader({ logoUrl }: EmailBrandProps) {
  const src = resolveLogoUrl(logoUrl)

  return (
    <Section className="mb-6">
      <Row>
        <Column className="w-[72px] align-middle">
          <Img
            src={src}
            alt="Crypto Watcher"
            width={64}
            height={64}
            className="block h-16 w-16 object-contain"
          />
        </Column>
        <Column className="pl-0 align-middle">
          <Text className="m-0 text-2xl font-bold tracking-tight text-foreground">
            Crypto<span className="text-primary">Watcher</span>
          </Text>
        </Column>
      </Row>
    </Section>
  )
}

export function EmailShell({ preview, logoUrl, children }: EmailShellProps) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Raleway"
          fallbackFontFamily={['Helvetica', 'Arial', 'sans-serif']}
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700;800&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Tailwind
        config={emailTailwindConfig as React.ComponentProps<typeof Tailwind>['config']}
      >
        <Body className="m-0 bg-background py-6 font-sans text-foreground">
          <Container className="mx-auto max-w-[560px] px-4">
            <Section className="rounded-2xl border border-solid border-border bg-card px-8 py-8">
              <EmailBrandHeader logoUrl={logoUrl} />
              {children}
            </Section>
            <Text className="mt-6 text-center text-xs leading-5 text-muted-foreground">
              Crypto Watcher - expert-reviewed blockchain risk analysis
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
