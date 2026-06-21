import launchStory from '../content/launch-story.md?raw'
import whatWeAreBuilding from '../content/what-we-are-building.md?raw'
import whereWeAreGoing from '../content/where-we-are-going.md?raw'

export type BlogPost = {
  slug: string
  title: string
  navLabel: string
  excerpt: string
  date: string
  tags: string[]
  featured: boolean
  content: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'launch-story',
    title: "We're building the Moody's of crypto — and we're ready to launch",
    navLabel: 'Launch story',
    excerpt:
      "Why Crypto Watcher takes inspiration from S&P, Moody's, and Fitch — and why expert-governed risk scores beat vote-to-rate.",
    date: '2025-06-21',
    tags: ['Launch', 'Vision'],
    featured: true,
    content: launchStory,
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
    content: whatWeAreBuilding,
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
    content: whereWeAreGoing,
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export function formatBlogDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${isoDate}T12:00:00`))
}

/** Remove the markdown H1 so the page header is the single title. */
export function stripLeadingHeading(content: string): string {
  return content.replace(/^#\s+.+\n+/, '')
}
