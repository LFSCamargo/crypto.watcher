import { cn } from '../../../lib/utils'
import { renderBlogMarkdown } from '../lib/render-markdown'

type BlogMarkdownProps = {
  content: string
  className?: string
}

export function BlogMarkdown({ content, className }: BlogMarkdownProps) {
  return <article className={cn('max-w-none', className)}>{renderBlogMarkdown(content)}</article>
}
