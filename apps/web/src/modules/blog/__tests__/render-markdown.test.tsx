import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BlogMarkdown } from '../components/blog-markdown'
import { parseMarkdownBlocks } from '../lib/parse-markdown-blocks'

describe('parseMarkdownBlocks', () => {
  it('parses headings, lists, and paragraphs in a single pass', () => {
    const blocks = parseMarkdownBlocks('# Title\n\nIntro paragraph.\n\n- one\n- two')

    expect(blocks).toEqual([
      { kind: 'h1', text: 'Title', key: 0 },
      { kind: 'paragraph', text: 'Intro paragraph.', key: 2 },
      { kind: 'ul', items: ['one', 'two'], key: 4 },
    ])
  })

  it('parses blockquotes and ordered lists', () => {
    const blocks = parseMarkdownBlocks('> quoted\n> line\n\n1. first\n2. second')

    expect(blocks).toEqual([
      { kind: 'blockquote', lines: ['quoted', 'line'], key: 0 },
      { kind: 'ol', items: ['first', 'second'], key: 3 },
    ])
  })
})

describe('BlogMarkdown', () => {
  it('renders inline links and emphasis from markdown', () => {
    render(
      <MemoryRouter>
        <BlogMarkdown content={'Visit [home](/) and read **bold** text.'} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'home' })).toHaveAttribute('href', '/')
    expect(screen.getByText('bold')).toHaveProperty('tagName', 'STRONG')
  })
})
