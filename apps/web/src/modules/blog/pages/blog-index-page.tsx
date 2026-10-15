import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import { Button } from '../../../components/ui'
import { BlogHero } from '../components/blog-hero'
import { BlogPostCard } from '../components/blog-post-card'
import { blogPosts } from '../lib/posts'

export function BlogIndexPage() {
  const featuredPost = blogPosts.find((post) => post.featured) ?? blogPosts[0]
  const otherPosts = blogPosts.filter((post) => post.slug !== featuredPost?.slug)

  return (
    <div>
      <BlogHero
        title="News, updates & the story behind Crypto Watcher"
        description="What we're building, where we're headed, and why we're bringing classification-house discipline to crypto risk."
      />

      {featuredPost && (
        <section className="mb-10">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Featured
          </h2>
          <BlogPostCard post={featuredPost} featured headingLevel="h3" />
        </section>
      )}

      {otherPosts.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            More articles
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {otherPosts.map((post) => (
              <BlogPostCard key={post.slug} post={post} headingLevel="h3" />
            ))}
          </div>
        </section>
      )}

      <section className="glass-card-flat mt-12 rounded-3xl p-6 md:p-8">
        <h2 className="text-xl font-bold">Ready to explore?</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Browse council-reviewed projects, read the whitepaper, or request a review of a
          project — free during launch.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="gap-2">
            <Link to="/app">
              Browse projects
              <ArrowRight size={16} aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/app/analysis-request">Request a review</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/docs/whitepaper">Read the whitepaper</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
