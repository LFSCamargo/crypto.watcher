import launchStory from '../content/launch-story.md?raw'
import whatWeAreBuilding from '../content/what-we-are-building.md?raw'
import whereWeAreGoing from '../content/where-we-are-going.md?raw'
import { blogPostMeta, getBlogPostMeta, type BlogPostMeta } from './blog-post-meta'

export type BlogPost = BlogPostMeta & {
  content: string
}

const contentBySlug: Record<string, string> = {
  'launch-story': launchStory,
  'what-we-are-building': whatWeAreBuilding,
  'where-we-are-going': whereWeAreGoing,
}

export const blogPosts: BlogPost[] = blogPostMeta.map((meta) => ({
  ...meta,
  content: contentBySlug[meta.slug] ?? '',
}))

export function getBlogPost(slug: string): BlogPost | undefined {
  const meta = getBlogPostMeta(slug)
  if (!meta) return undefined
  return { ...meta, content: contentBySlug[slug] ?? '' }
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

export { blogPostMeta, getBlogPostMeta }
