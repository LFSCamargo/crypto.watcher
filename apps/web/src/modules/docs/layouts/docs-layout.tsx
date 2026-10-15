import { Outlet } from 'react-router-dom'
import { BookOpen, Coins, Question, Rocket, Scales } from '@phosphor-icons/react'
import { ResourceLayout } from '../../../components/layout/resource-layout'

const docsLinks = [
  { href: '/docs', label: 'Introduction', icon: BookOpen },
  { href: '/docs/whitepaper', label: 'Whitepaper', icon: Rocket },
  { href: '/docs/tokenomics', label: 'Tokenomics', icon: Coins },
  { href: '/docs/governance', label: 'Governance', icon: Scales },
  { href: '/docs/faq', label: 'FAQ', icon: Question },
]

export function DocsLayout() {
  return (
    <ResourceLayout navLabel="Documentation" links={docsLinks} pager>
      <Outlet />
    </ResourceLayout>
  )
}
