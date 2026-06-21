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
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Featured
          </p>
          <BlogPostCard post={featuredPost} featured />
        </section>
      )}

      {otherPosts.length > 0 && (
        <section>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            More articles
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {otherPosts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 rounded-3xl border border-border bg-card p-6 md:p-8">
        <h2 className="text-xl font-bold">Ready to explore?</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Browse expert-reviewed projects, read the whitepaper, or request an official
          risk analysis for your protocol.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="gap-2">
            <Link to="/app">
              Launch App
              <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/docs/whitepaper">Read Whitepaper</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
