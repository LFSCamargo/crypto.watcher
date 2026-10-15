import {
  RiBookOpenLine,
  RiCoinsLine,
  RiCompass3Line,
  RiFileTextLine,
  RiGovernmentLine,
  RiNewsLine,
  RiQuestionLine,
  RiScales3Line,
  RiStackLine,
} from '@remixicon/react'

type NavIcon = typeof RiStackLine

export interface NavItem {
  href: string
  label: string
  icon: NavIcon
  end?: boolean
}

export interface ResourceItem extends NavItem {
  description: string
}

export interface FooterLinkGroupData {
  title: string
  links: { to: string; label: string }[]
}

export const primaryNavItems: NavItem[] = [
  { href: '/app', label: 'Projects', icon: RiStackLine, end: true },
  { href: '/app/in-analysis', label: 'In Analysis', icon: RiCompass3Line },
  { href: '/app/governance', label: 'Governance', icon: RiScales3Line },
]

export const resourceNavItems: ResourceItem[] = [
  {
    href: '/blog',
    icon: RiNewsLine,
    label: 'Blog',
    description: 'Launch story, updates and roadmap news.',
  },
  {
    href: '/docs',
    icon: RiBookOpenLine,
    label: 'Introduction',
    description: 'What Crypto Watcher is and how reviews work.',
    end: true,
  },
  {
    href: '/docs/whitepaper',
    icon: RiFileTextLine,
    label: 'Whitepaper',
    description: 'The thesis behind the expert-review model.',
  },
  {
    href: '/docs/tokenomics',
    icon: RiCoinsLine,
    label: 'Tokenomics',
    description: 'CWT supply and what protocol governance controls.',
  },
  {
    href: '/docs/governance',
    icon: RiGovernmentLine,
    label: 'Governance',
    description: 'Council reviews versus protocol proposals.',
  },
  {
    href: '/docs/faq',
    icon: RiQuestionLine,
    label: 'FAQ',
    description: 'Scores, requests and participation.',
  },
]

export const footerLinkGroups: FooterLinkGroupData[] = [
  {
    title: 'Product',
    links: [
      { to: '/app', label: 'Projects' },
      { to: '/app/in-analysis', label: 'In Analysis' },
      { to: '/app/governance', label: 'Governance' },
      { to: '/app/analysis-request', label: 'Request a review' },
    ],
  },
  {
    title: 'Resources',
    links: resourceNavItems.map((item) => ({ to: item.href, label: item.label })),
  },
  {
    title: 'Account',
    links: [
      { to: '/auth/signin', label: 'Sign in' },
      { to: '/auth/signup', label: 'Create account' },
      { to: '/app/profile', label: 'Profile' },
    ],
  },
]
