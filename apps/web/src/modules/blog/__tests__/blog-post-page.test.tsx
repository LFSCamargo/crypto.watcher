import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { BlogPostPage } from '../pages/blog-post-page'

describe('BlogPostPage', () => {
  it('renders the launch story article from markdown', () => {
    render(
      <MemoryRouter initialEntries={['/blog/launch-story']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: /we're building the moody's of crypto/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/classification houses/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /create account/i })).toHaveAttribute(
      'href',
      '/auth/signup',
    )
  })

  it('suggests the other articles without repeating the current one', () => {
    render(
      <MemoryRouter initialEntries={['/blog/launch-story']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const related = screen.getByRole('region', { name: 'More from the blog' })
    const links = within(related).getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link).not.toHaveAttribute('href', '/blog/launch-story')
    }
    expect(screen.queryByText(/evidence submission/i)).not.toBeInTheDocument()
  })

  it('describes the request flow without a fee', () => {
    render(
      <MemoryRouter initialEntries={['/blog/what-we-are-building']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.queryByText(/paid review/i)).not.toBeInTheDocument()
    expect(screen.getByText(/free during launch/i)).toBeInTheDocument()
  })

  it('redirects unknown slugs to the blog index', () => {
    render(
      <MemoryRouter initialEntries={['/blog/not-a-real-post']}>
        <Routes>
          <Route path="/blog" element={<div>Blog index</div>} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Blog index')).toBeInTheDocument()
  })
})
