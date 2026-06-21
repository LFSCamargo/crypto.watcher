import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

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

export function renderBlogMarkdown(content: string): ReactNode[] {
  const lines = content.split('\n')
  const nodes: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]?.trimEnd() ?? ''

    if (line.trim() === '') {
      index += 1
      continue
    }

    if (line.startsWith('# ')) {
      nodes.push(
        <h1 key={`h1-${index}`} className="heading-2 mb-6 mt-10 first:mt-0">
          {renderInline(line.slice(2), `h1-${index}`)}
        </h1>,
      )
      index += 1
      continue
    }

    if (line.startsWith('## ')) {
      nodes.push(
        <h2 key={`h2-${index}`} className="heading-3 mb-4 mt-10 border-b border-border/50 pb-2">
          {renderInline(line.slice(3), `h2-${index}`)}
        </h2>,
      )
      index += 1
      continue
    }

    if (line.startsWith('### ')) {
      nodes.push(
        <h3 key={`h3-${index}`} className="mb-3 mt-8 text-lg font-bold">
          {renderInline(line.slice(4), `h3-${index}`)}
        </h3>,
      )
      index += 1
      continue
    }

    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={`hr-${index}`} className="my-10 border-border/60" />)
      index += 1
      continue
    }

    if (line.startsWith('> ')) {
      const quoteLines: string[] = []
      while (index < lines.length && lines[index]?.startsWith('> ')) {
        quoteLines.push(lines[index]!.slice(2))
        index += 1
      }
      nodes.push(
        <blockquote
          key={`quote-${index}`}
          className="mb-5 border-l-4 border-primary/40 bg-primary/5 px-4 py-3 text-muted-foreground"
        >
          {quoteLines.map((quoteLine, quoteIndex) => (
            <p key={quoteIndex} className={quoteIndex > 0 ? 'mt-2' : undefined}>
              {renderInline(quoteLine, `quote-${index}-${quoteIndex}`)}
            </p>
          ))}
        </blockquote>,
      )
      continue
    }

    if (line.startsWith('- ')) {
      const items: string[] = []
      while (index < lines.length && lines[index]?.startsWith('- ')) {
        items.push(lines[index]!.slice(2))
        index += 1
      }
      nodes.push(
        <ul key={`ul-${index}`} className="mb-5 list-disc space-y-2 pl-6 text-muted-foreground">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="leading-relaxed">
              {renderInline(item, `ul-${index}-${itemIndex}`)}
            </li>
          ))}
        </ul>,
      )
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\d+\.\s/.test(lines[index] ?? '')) {
        items.push(lines[index]!.replace(/^\d+\.\s/, ''))
        index += 1
      }
      nodes.push(
        <ol key={`ol-${index}`} className="mb-5 list-decimal space-y-2 pl-6 text-muted-foreground">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="leading-relaxed">
              {renderInline(item, `ol-${index}-${itemIndex}`)}
            </li>
          ))}
        </ol>,
      )
      continue
    }

    if (line.startsWith('|')) {
      const tableLines: string[] = []
      while (index < lines.length && lines[index]?.startsWith('|')) {
        tableLines.push(lines[index]!)
        index += 1
      }

      const rows = tableLines
        .filter((row) => !/^\|\s*-/.test(row))
        .map((row) =>
          row
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim()),
        )

      const [header = [], ...body] = rows

      nodes.push(
        <div key={`table-${index}`} className="mb-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-secondary/60">
              <tr>
                {header.map((cell, cellIndex) => (
                  <th
                    key={cellIndex}
                    className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-foreground"
                  >
                    {renderInline(cell, `th-${index}-${cellIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {body.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3 text-muted-foreground">
                      {renderInline(cell, `td-${index}-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    const paragraphLines: string[] = [line]
    index += 1
    while (index < lines.length) {
      const nextLine = lines[index]?.trimEnd() ?? ''
      if (
        nextLine.trim() === '' ||
        nextLine.startsWith('#') ||
        nextLine.startsWith('- ') ||
        nextLine.startsWith('> ') ||
        nextLine.startsWith('|') ||
        /^\d+\.\s/.test(nextLine) ||
        /^---+$/.test(nextLine.trim())
      ) {
        break
      }
      paragraphLines.push(nextLine)
      index += 1
    }

    nodes.push(renderParagraph(paragraphLines.join(' '), `p-${index}`))
  }

  return nodes
}
