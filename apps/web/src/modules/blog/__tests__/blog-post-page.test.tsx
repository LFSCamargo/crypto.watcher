import { render, screen } from '@testing-library/react'
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
