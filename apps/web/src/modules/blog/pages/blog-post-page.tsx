import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Tag } from '@phosphor-icons/react'
import { Button } from '../../../components/ui'
import { BlogMarkdown } from '../components/blog-markdown'
import { BlogPostCard } from '../components/blog-post-card'
import {
  blogPosts,
  estimateReadingTime,
  formatBlogDate,
  getBlogPost,
  stripLeadingHeading,
} from '../lib/posts'

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getBlogPost(slug) : undefined

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  const readingTime = estimateReadingTime(post.content)
  const relatedPosts = blogPosts.filter((other) => other.slug !== post.slug).slice(0, 2)

  return (
    <div>
      <Link
        to="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden />
        Back to blog
      </Link>

      <header className="mb-10 border-b border-border/50 pb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} aria-hidden />
            {readingTime} min read
          </span>
        </div>

        <h1 className="heading-2 mb-4 text-balance">{post.title}</h1>
        <p className="body-large max-w-2xl text-balance">{post.excerpt}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold"
            >
              <Tag size={12} aria-hidden />
              {tag}
            </span>
          ))}
        </div>
      </header>

      <BlogMarkdown content={stripLeadingHeading(post.content)} />

      {relatedPosts.length > 0 && (
        <section aria-labelledby="related-posts-heading" className="mt-12">
          <h2 id="related-posts-heading" className="mb-4 text-xl font-bold">
            More from the blog
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {relatedPosts.map((related) => (
              <BlogPostCard key={related.slug} post={related} headingLevel="h3" />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 rounded-3xl bg-foreground p-6 text-background md:p-8">
        <h2 className="text-xl font-bold">Join the first launch</h2>
        <p className="mt-2 max-w-xl text-sm text-background/70">
          Unite with researchers, governors, and builders who believe crypto deserves
          independent risk classification — not vote-to-rate theater.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            variant="secondary"
            className="rounded-full bg-background text-foreground hover:bg-background/90"
          >
            <Link to="/auth/signup">Create account</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-background/30 bg-transparent text-background hover:bg-background/10"
          >
            <Link to="/app/analysis-request">Request a review</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
