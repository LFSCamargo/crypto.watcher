import { useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { List } from '@phosphor-icons/react'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '../ui'
import { OnThisPage } from './on-this-page'
import { ResourceNavLinks, type ResourceLink } from './resource-nav-links'
import { ResourcePager } from './resource-pager'
import { useHashScroll } from './use-hash-scroll'
import { usePageHeadings } from './use-page-headings'

interface ResourceLayoutProps {
  navLabel: string
  links: ResourceLink[]
  pager?: boolean
  children: ReactNode
}

const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path)

/** Shared reading layout for docs and blog: glass sidebar, opaque reading column. */
export function ResourceLayout({
  navLabel,
  links,
  pager = false,
  children,
}: ResourceLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const contentRef = useRef<HTMLDivElement>(null)
  const activePath = normalize(pathname)
  const activeIndex = links.findIndex((link) => link.href === activePath)
  const activeHref = links[activeIndex]?.href
  const headings = usePageHeadings(contentRef, activePath)
  useHashScroll()

  return (
    <div className="container-wide pb-12 pt-4 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 lg:pt-8 xl:grid-cols-[15rem_minmax(0,1fr)_12rem]">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label={`${navLabel} menu`}
            className="glass-card-flat mb-6 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold lg:hidden"
          >
            <List size={18} aria-hidden />
            {links[activeIndex]?.label ?? navLabel}
          </button>
        </SheetTrigger>
        <SheetContent side="left" aria-describedby="resource-menu-description">
          <div className="pr-10">
            <SheetTitle>{navLabel}</SheetTitle>
            <SheetDescription id="resource-menu-description">
              Choose a page to read.
            </SheetDescription>
          </div>
          <ResourceNavLinks
            links={links}
            activeHref={activeHref}
            onNavigate={() => setMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <aside className="hidden lg:block">
        <nav aria-label={navLabel} className="glass-card sticky top-24 rounded-3xl p-3">
          <ResourceNavLinks links={links} activeHref={activeHref} />
        </nav>
      </aside>

      <div ref={contentRef} className="min-w-0">
        <div className="mx-auto max-w-[72ch]">
          {children}
          {pager && (
            <ResourcePager label={navLabel} links={links} activeIndex={activeIndex} />
          )}
        </div>
      </div>

      <aside className="hidden xl:block">
        <div className="sticky top-24">
          <OnThisPage headings={headings} />
        </div>
      </aside>
    </div>
  )
}
