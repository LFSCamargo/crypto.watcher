import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Logo } from './logo'

interface HeaderLogoProps {
  className?: string
  imageClassName?: string
}

export function HeaderLogo({ className }: HeaderLogoProps) {
  return (
    <Link
      to="/"
      className={cn(
        'inline-flex items-center rounded-2xl px-4 py-0 transition-opacity hover:opacity-90 dark:bg-transparent dark:px-0 dark:py-0',
        className,
      )}
      aria-label="Crypto Watcher home"
    >
      <Logo showWordmark={false} size="xxl" />
    </Link>
  )
}
