import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BlogPostCard } from '../components/blog-post-card'
import { blogPosts } from '../lib/posts'

describe('BlogPostCard', () => {
  const post = blogPosts[0]!

  it('uses the same mobile header height for featured and standard cards', () => {
    const { container: featured } = render(
      <MemoryRouter>
        <BlogPostCard post={post} featured />
      </MemoryRouter>,
    )
    const { container: standard } = render(
      <MemoryRouter>
        <BlogPostCard post={post} />
      </MemoryRouter>,
    )

    const featuredHeader = featured.querySelector('a > div')
    const standardHeader = standard.querySelector('a > div')

    expect(featuredHeader).toHaveClass('h-40')
    expect(standardHeader).toHaveClass('h-40')
  })
})
