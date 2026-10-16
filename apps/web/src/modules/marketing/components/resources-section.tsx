import { Link } from 'react-router-dom'
import { resourceNavItems } from '../../../components/layout/navigation'
import { ToneIcon } from '../../../components/ui'
import { SectionGlow } from './section-glow'
import { SectionHeading } from './section-heading'

export function ResourcesSection() {
  return (
    <section
      aria-labelledby="resources-title"
      className="relative overflow-hidden border-t border-border"
    >
      <SectionGlow
        spots={[
          { tone: 'coral', at: '10% 15%' },
          { tone: 'teal', at: '90% 85%' },
        ]}
      />
      <div className="container-wide section-padding relative">
        <SectionHeading
          id="resources-title"
          eyebrow="Resources"
          tone="coral"
          title="Learn how it works"
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resourceNavItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-[transform,border-color] duration-300 ease-glass hover:-translate-y-0.5 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                <ToneIcon icon={item.icon} tone={item.tone} />
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
