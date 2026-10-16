import { Link } from 'react-router-dom'
import type { Icon } from '@phosphor-icons/react'
import { cn } from '../../lib/utils'

export interface ResourceLink {
  href: string
  label: string
  icon?: Icon
}

interface ResourceNavLinksProps {
  links: ResourceLink[]
  activeHref: string | undefined
  onNavigate?: () => void
}

export function ResourceNavLinks({
  links,
  activeHref,
  onNavigate,
}: ResourceNavLinksProps) {
  return (
    <ul className="space-y-1">
      {links.map((link) => {
        const isActive = link.href === activeHref
        const LinkIcon = link.icon
        return (
          <li key={link.href}>
            <Link
              to={link.href}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              {LinkIcon && (
                <LinkIcon
                  size={18}
                  weight={isActive ? 'fill' : 'regular'}
                  className={isActive ? 'text-primary-strong' : undefined}
                  aria-hidden
                />
              )}
              {link.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
