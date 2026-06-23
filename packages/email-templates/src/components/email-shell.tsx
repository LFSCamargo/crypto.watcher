import {
  Body,
  Column,
  Container,
  Font,
  Head,
  Html,
  Img,
  Link,
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
  return (
    <Section className="mb-6">
      <Row>
        <Column className="w-[72px] align-middle">
          <Img
            src={resolveLogoUrl(logoUrl)}
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

export function EmailShell({ preview, children, logoUrl }: EmailShellProps) {
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
        <Body className="m-0 py-24 font-sans text-foreground bg-[#F2f2f2]">
          <Container className="mx-auto max-w-[560px] px-4">
            <Section className="rounded-2xl border border-solid border-border bg-card px-8 py-8">
              <EmailBrandHeader logoUrl={logoUrl} />
              {children}
            </Section>
            <Text className="mt-6 text-center text-xs leading-5 text-background">
              <Link
                href="https://testnet.cryptowatcher.pro"
                className="text-black underline"
              >
                Crypto Watcher
              </Link>{' '}
              - expert-reviewed blockchain risk analysis
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
