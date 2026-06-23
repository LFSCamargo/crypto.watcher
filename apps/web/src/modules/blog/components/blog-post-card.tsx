import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Tag } from '@phosphor-icons/react'
import type { BlogPost } from '../lib/posts'
import { estimateReadingTime, formatBlogDate } from '../lib/posts'
import { cn } from '../../../lib/utils'

type BlogPostCardProps = {
  post: BlogPost
  featured?: boolean
}

export function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  const readingTime = estimateReadingTime(post.content)

  return (
    <Link
      to={`/blog/${post.slug}`}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-lg',
        featured && 'lg:flex-row lg:items-stretch',
      )}
    >
      <div
        className={cn(
          'relative flex h-40 shrink-0 items-center justify-center bg-foreground text-background',
          featured && 'lg:h-auto lg:min-h-full lg:w-2/5',
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,214,0,0.25),transparent_55%)]" />
        <div className="relative px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {post.tags[0]}
          </p>
          <p className="mt-2 text-sm font-medium text-background/70">
            {formatBlogDate(post.date)}
          </p>
        </div>
      </div>

      <div className={cn('flex flex-1 flex-col p-6', featured && 'lg:p-8')}>
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock size={14} />
            {readingTime} min read
          </span>
          {post.tags.slice(1).map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
              <Tag size={12} />
              {tag}
            </span>
          ))}
        </div>

        <h2
          className={cn(
            'font-bold text-foreground transition-colors group-hover:text-primary',
            featured ? 'text-2xl md:text-3xl' : 'text-lg',
          )}
        >
          {post.title}
        </h2>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>

        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
          Read article
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  )
}
