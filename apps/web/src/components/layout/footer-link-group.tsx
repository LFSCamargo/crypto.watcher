import { useId } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowRightLine } from '@remixicon/react'
import type { FooterLinkGroupData } from './navigation'

export function FooterLinkGroup({ title, links }: FooterLinkGroupData) {
  const headingId = useId()

  return (
    <div>
      <h3
        id={headingId}
        className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground"
      >
        <span className="h-px w-4 bg-primary" aria-hidden />
        {title}
      </h3>
      <ul aria-labelledby={headingId} className="space-y-2.5">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="group inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
              <RiArrowRightLine
                className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
