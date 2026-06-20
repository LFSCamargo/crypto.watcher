import { Link } from 'react-router-dom'
import { GithubLogo, TwitterLogo, DiscordLogo } from '@phosphor-icons/react'
import { Logo } from '../../../components/brand/logo'

const footerLinks = {
  product: [
    { label: 'Launch App', href: '/app' },
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Roadmap', href: '/docs/roadmap' },
  ],
  resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Whitepaper', href: '/docs/whitepaper' },
    { label: 'Governance', href: '/docs/governance' },
    { label: 'FAQ', href: '/docs/faq' },
  ],
  community: [
    { label: 'Discord', href: '#', external: true },
    { label: 'Twitter', href: '#', external: true },
    { label: 'GitHub', href: '#', external: true },
  ],
}

const socialLinks = [
  { icon: TwitterLogo, href: '#', label: 'Twitter' },
  { icon: DiscordLogo, href: '#', label: 'Discord' },
  { icon: GithubLogo, href: '#', label: 'GitHub' },
]

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="container-wide py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex transition-opacity hover:opacity-80">
              <Logo size="lg" />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Reputation-weighted risk analysis for crypto projects. Make informed
              investment decisions with community-driven insights.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  aria-label={social.label}
                >
                  <social.icon size={20} weight="fill" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Community</h4>
            <ul className="space-y-3">
              {footerLinks.community.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Crypto Watcher. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
