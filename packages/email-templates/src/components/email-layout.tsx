import { Section, Text } from '@react-email/components'
import type { ReactNode } from 'react'

type EmailLayoutProps = {
  children: ReactNode
}

export function EmailLayout({ children }: EmailLayoutProps) {
  return (
    <Section style={cardStyle}>
      <Text style={brandStyle}>Crypto Watcher</Text>
      {children}
    </Section>
  )
}

const cardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e8e0c8',
  borderRadius: '16px',
  padding: '32px',
} as const

const brandStyle = {
  color: '#111111',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  margin: '0 0 24px',
  textTransform: 'uppercase' as const,
} as const
