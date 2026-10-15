import type { PageHeading } from './use-page-headings'

export function OnThisPage({ headings }: { headings: PageHeading[] }) {
  if (headings.length < 2) return null

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-1 border-l border-border">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className="-ml-px block border-l border-transparent py-1 pl-3 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              {heading.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
