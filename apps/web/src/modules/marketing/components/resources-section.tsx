import { Link } from 'react-router-dom'
import { RiArrowRightLine, RiArrowRightUpLine, RiNewspaperLine } from '@remixicon/react'
import { resourceNavItems } from '../../../components/layout/navigation'
import { ToneIcon } from '../../../components/ui'
import { blogPostMeta } from '../../blog/lib/blog-post-meta'
import { Reveal } from './reveal'
import { SectionGlow } from './section-glow'
import { SectionHeading } from './section-heading'
import { SpotlightCard } from './spotlight-card'

const [latestPost, ...olderPosts] = [...blogPostMeta].sort((a, b) =>
  b.date.localeCompare(a.date),
)

const resource = (href: string) => resourceNavItems.find((item) => item.href === href)
const startPath = ['/docs', '/docs/whitepaper', '/docs/faq']
  .map(resource)
  .filter((item) => item !== undefined)
const deepDives = ['/docs/tokenomics', '/docs/governance']
  .map(resource)
  .filter((item) => item !== undefined)

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

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
        <Reveal>
          <SectionHeading
            id="resources-title"
            eyebrow="Resources"
            tone="coral"
            title="Learn how it works"
            description="Three short reads get you from zero to confident. The blog covers what we're building and why."
          />
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-3">
          {latestPost && (
            <Reveal className="lg:col-span-2 lg:row-span-2">
              <SpotlightCard
                tone="coral"
                aria-labelledby="featured-post-title"
                className="flex h-full flex-col justify-between gap-6 p-8"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-gradient-to-br from-tone-coral/30 to-tone-amber/10 blur-2xl"
                />
                <div className="space-y-4">
                  <p className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <RiNewspaperLine
                      aria-hidden
                      className="h-4 w-4 text-tone-coral-strong"
                    />
                    From the blog · {formatDate(latestPost.date)}
                  </p>
                  <h3
                    id="featured-post-title"
                    className="max-w-xl text-balance text-2xl font-bold md:text-3xl"
                  >
                    {latestPost.title}
                  </h3>
                  <p className="max-w-xl text-muted-foreground">{latestPost.excerpt}</p>
                  <ul className="flex flex-wrap gap-2" aria-label="Tags">
                    {latestPost.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full bg-tone-coral/10 px-2.5 py-0.5 text-xs font-medium text-tone-coral-strong"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
                {olderPosts.length > 0 && (
                  <ul
                    aria-label="More from the blog"
                    className="divide-y divide-border border-y border-border"
                  >
                    {olderPosts.map((post) => (
                      <li key={post.slug}>
                        <Link
                          to={`/blog/${post.slug}`}
                          className="group flex items-center justify-between gap-4 py-3 text-sm"
                        >
                          <span className="font-semibold group-hover:underline">
                            {post.title}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatDate(post.date)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to={`/blog/${latestPost.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
                  >
                    Read the story
                    <RiArrowRightLine aria-hidden className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/blog"
                    className="text-sm font-semibold underline-offset-4 hover:underline"
                  >
                    All posts
                  </Link>
                </div>
              </SpotlightCard>
            </Reveal>
          )}

          <Reveal delay={0.1}>
            <SpotlightCard
              tone="sky"
              aria-labelledby="start-here-title"
              className="h-full"
            >
              <h3 id="start-here-title" className="mb-4 font-bold">
                New here? Start with these
              </h3>
              <ol className="relative space-y-1">
                <span
                  aria-hidden
                  className="absolute bottom-5 left-[1.1rem] top-5 w-px bg-gradient-to-b from-tone-sky via-tone-teal to-tone-pink"
                />
                {startPath.map((item, index) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="group relative flex items-center gap-3 rounded-2xl p-1.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{item.label}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                      <RiArrowRightLine
                        aria-hidden
                        className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  </li>
                ))}
              </ol>
            </SpotlightCard>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {deepDives.map((item, index) => (
              <Reveal key={item.href} delay={0.15 + index * 0.05}>
                <Link
                  to={item.href}
                  className="group flex h-full flex-col gap-3 rounded-3xl border border-border bg-card p-5 transition-[transform,border-color] duration-300 ease-glass hover:-translate-y-1 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  <span className="flex items-center justify-between">
                    <ToneIcon icon={item.icon} tone={item.tone} />
                    <RiArrowRightUpLine
                      aria-hidden
                      className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                  <span>
                    <span className="block font-bold">{item.label}</span>
                    <span className="block text-sm text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
