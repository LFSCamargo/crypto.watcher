/** Blog post metadata (no markdown imports — safe for Node build scripts). */

export type BlogPostMeta = {
  slug: string
  title: string
  navLabel: string
  excerpt: string
  date: string
  tags: string[]
  featured: boolean
}

export const blogPostMeta: BlogPostMeta[] = [
  {
    slug: 'launch-story',
    title: "We're building the Moody's of crypto — and we're ready to launch",
    navLabel: 'Launch story',
    excerpt:
      "Why Crypto Watcher takes inspiration from S&P, Moody's, and Fitch — and why expert-governed risk scores beat vote-to-rate.",
    date: '2025-06-21',
    tags: ['Launch', 'Vision'],
    featured: true,
  },
  {
    slug: 'what-we-are-building',
    title: "What we've been building — a progress update",
    navLabel: 'Progress update',
    excerpt:
      'Platform progress ahead of our first launch: safety index, governor workflow, on-chain registry, and protocol governance.',
    date: '2025-06-18',
    tags: ['Update', 'Product'],
    featured: false,
  },
  {
    slug: 'where-we-are-going',
    title: "Where we're going — the Crypto Watcher roadmap",
    navLabel: 'Roadmap',
    excerpt:
      'From MVP through Phase 3 to maturity — what ships when, and what we will never build.',
    date: '2025-06-15',
    tags: ['Roadmap', 'Strategy'],
    featured: false,
  },
]

export function getBlogPostMeta(slug: string): BlogPostMeta | undefined {
  return blogPostMeta.find((post) => post.slug === slug)
}
