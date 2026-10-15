import { Link } from 'react-router-dom'
import { resourceNavItems } from '../../../components/layout/navigation'
import { SectionHeading } from './section-heading'

export function ResourcesSection() {
  return (
    <section aria-labelledby="resources-title" className="border-t border-border">
      <div className="container-wide section-padding">
        <SectionHeading
          id="resources-title"
          eyebrow="Resources"
          title="Learn how it works"
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resourceNavItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="flex h-full gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <item.icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                <span>
                  <span className="block font-bold">{item.label}</span>
                  <span className="block text-sm text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
