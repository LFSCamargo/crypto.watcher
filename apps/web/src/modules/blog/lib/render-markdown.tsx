import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { parseMarkdownBlocks, type MarkdownBlock } from './parse-markdown-blocks'

const linkClassName =
  'font-semibold text-foreground underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary'

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const token = match[0]
    const tokenKey = `${keyPrefix}-${match.index}`

    if (token.startsWith('**')) {
      nodes.push(
        <strong key={tokenKey} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith('*')) {
      nodes.push(<em key={tokenKey}>{token.slice(1, -1)}</em>)
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (linkMatch) {
        const [, label, href = ''] = linkMatch
        if (href.startsWith('/')) {
          nodes.push(
            <Link key={tokenKey} to={href} className={linkClassName}>
              {label}
            </Link>,
          )
        } else {
          nodes.push(
            <a key={tokenKey} href={href} className={linkClassName} target="_blank" rel="noreferrer">
              {label}
            </a>,
          )
        }
      }
    }

    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : [text]
}

function renderParagraph(text: string, key: string) {
  return (
    <p key={key} className="mb-5 leading-relaxed text-muted-foreground">
      {renderInline(text, key)}
    </p>
  )
}

function renderBlock(block: MarkdownBlock): ReactNode {
  const key = `${block.kind}-${block.key}`

  switch (block.kind) {
    case 'h1':
      return (
        <h1 key={key} className="heading-2 mb-6 mt-10 first:mt-0">
          {renderInline(block.text, key)}
        </h1>
      )
    case 'h2':
      return (
        <h2 key={key} className="heading-3 mb-4 mt-10 border-b border-border/50 pb-2">
          {renderInline(block.text, key)}
        </h2>
      )
    case 'h3':
      return (
        <h3 key={key} className="mb-3 mt-8 text-lg font-bold">
          {renderInline(block.text, key)}
        </h3>
      )
    case 'hr':
      return <hr key={key} className="my-10 border-border/60" />
    case 'blockquote':
      return (
        <blockquote
          key={key}
          className="mb-5 border-l-4 border-primary/40 bg-primary/5 px-4 py-3 text-muted-foreground"
        >
          {block.lines.map((quoteLine, quoteIndex) => (
            <p key={quoteIndex} className={quoteIndex > 0 ? 'mt-2' : undefined}>
              {renderInline(quoteLine, `${key}-${quoteIndex}`)}
            </p>
          ))}
        </blockquote>
      )
    case 'ul':
      return (
        <ul key={key} className="mb-5 list-disc space-y-2 pl-6 text-muted-foreground">
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex} className="leading-relaxed">
              {renderInline(item, `${key}-${itemIndex}`)}
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol key={key} className="mb-5 list-decimal space-y-2 pl-6 text-muted-foreground">
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex} className="leading-relaxed">
              {renderInline(item, `${key}-${itemIndex}`)}
            </li>
          ))}
        </ol>
      )
    case 'table': {
      const [header = [], ...body] = block.rows
      return (
        <div key={key} className="mb-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-secondary/60">
              <tr>
                {header.map((cell, cellIndex) => (
                  <th
                    key={cellIndex}
                    className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-foreground"
                  >
                    {renderInline(cell, `${key}-th-${cellIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {body.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3 text-muted-foreground">
                      {renderInline(cell, `${key}-td-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    case 'paragraph':
      return renderParagraph(block.text, key)
  }
}

export function renderBlogMarkdown(content: string): ReactNode[] {
  return parseMarkdownBlocks(content).map(renderBlock)
}
