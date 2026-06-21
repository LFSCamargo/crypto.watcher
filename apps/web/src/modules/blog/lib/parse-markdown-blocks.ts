export type MarkdownBlock =
  | { kind: 'h1'; text: string; key: number }
  | { kind: 'h2'; text: string; key: number }
  | { kind: 'h3'; text: string; key: number }
  | { kind: 'hr'; key: number }
  | { kind: 'blockquote'; lines: string[]; key: number }
  | { kind: 'ul'; items: string[]; key: number }
  | { kind: 'ol'; items: string[]; key: number }
  | { kind: 'table'; rows: string[][]; key: number }
  | { kind: 'paragraph'; text: string; key: number }

function isBlockStarter(line: string): boolean {
  const trimmed = line.trim()
  return (
    trimmed === '' ||
    line.startsWith('#') ||
    line.startsWith('- ') ||
    line.startsWith('> ') ||
    line.startsWith('|') ||
    /^\d+\.\s/.test(line) ||
    /^---+$/.test(trimmed)
  )
}

function consumeLinesWhile(
  lines: string[],
  startIndex: number,
  predicate: (line: string) => boolean,
  mapLine: (line: string) => string,
): { items: string[]; nextIndex: number } {
  const items: string[] = []
  let index = startIndex
  while (index < lines.length && predicate(lines[index] ?? '')) {
    items.push(mapLine(lines[index]!))
    index += 1
  }
  return { items, nextIndex: index }
}

function consumeParagraphLines(
  lines: string[],
  startIndex: number,
): { text: string; nextIndex: number } {
  const paragraphLines: string[] = [lines[startIndex]?.trimEnd() ?? '']
  let index = startIndex + 1
  while (index < lines.length) {
    const nextLine = lines[index]?.trimEnd() ?? ''
    if (isBlockStarter(nextLine)) {
      break
    }
    paragraphLines.push(nextLine)
    index += 1
  }
  return { text: paragraphLines.join(' '), nextIndex: index }
}

function parseTableRows(tableLines: string[]): string[][] {
  return tableLines
    .filter((row) => !/^\|\s*-/.test(row))
    .map((row) =>
      row
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim()),
    )
}

export function parseMarkdownBlocks(content: string): MarkdownBlock[] {
  const lines = content.split('\n')
  const blocks: MarkdownBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]?.trimEnd() ?? ''

    if (line.trim() === '') {
      index += 1
      continue
    }

    if (line.startsWith('# ')) {
      blocks.push({ kind: 'h1', text: line.slice(2), key: index })
      index += 1
      continue
    }

    if (line.startsWith('## ')) {
      blocks.push({ kind: 'h2', text: line.slice(3), key: index })
      index += 1
      continue
    }

    if (line.startsWith('### ')) {
      blocks.push({ kind: 'h3', text: line.slice(4), key: index })
      index += 1
      continue
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push({ kind: 'hr', key: index })
      index += 1
      continue
    }

    if (line.startsWith('> ')) {
      const quote = consumeLinesWhile(
        lines,
        index,
        (currentLine) => currentLine.startsWith('> '),
        (currentLine) => currentLine.slice(2),
      )
      blocks.push({ kind: 'blockquote', lines: quote.items, key: index })
      index = quote.nextIndex
      continue
    }

    if (line.startsWith('- ')) {
      const list = consumeLinesWhile(
        lines,
        index,
        (currentLine) => currentLine.startsWith('- '),
        (currentLine) => currentLine.slice(2),
      )
      blocks.push({ kind: 'ul', items: list.items, key: index })
      index = list.nextIndex
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const list = consumeLinesWhile(
        lines,
        index,
        (currentLine) => /^\d+\.\s/.test(currentLine),
        (currentLine) => currentLine.replace(/^\d+\.\s/, ''),
      )
      blocks.push({ kind: 'ol', items: list.items, key: index })
      index = list.nextIndex
      continue
    }

    if (line.startsWith('|')) {
      const table = consumeLinesWhile(
        lines,
        index,
        (currentLine) => currentLine.startsWith('|'),
        (currentLine) => currentLine,
      )
      blocks.push({ kind: 'table', rows: parseTableRows(table.items), key: index })
      index = table.nextIndex
      continue
    }

    const paragraph = consumeParagraphLines(lines, index)
    blocks.push({ kind: 'paragraph', text: paragraph.text, key: index })
    index = paragraph.nextIndex
  }

  return blocks
}
