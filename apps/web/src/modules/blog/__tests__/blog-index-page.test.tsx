import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BlogIndexPage } from '../pages/blog-index-page'

describe('BlogIndexPage', () => {
  it('renders the blog hero and featured launch article', () => {
    render(
      <MemoryRouter>
        <BlogIndexPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: /news, updates & the story behind crypto watcher/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/featured/i)).toBeInTheDocument()
    expect(screen.getByText(/moody's of crypto/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /browse projects/i })).toHaveAttribute(
      'href',
      '/app',
    )
    expect(screen.getByRole('link', { name: /request a review/i })).toHaveAttribute(
      'href',
      '/app/analysis-request',
    )
  })

  it('lists all blog articles', () => {
    render(
      <MemoryRouter>
        <BlogIndexPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/progress update/i)).toBeInTheDocument()
    expect(screen.getByText(/crypto watcher roadmap/i)).toBeInTheDocument()
  })
})
