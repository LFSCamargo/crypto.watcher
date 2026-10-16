import { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'
import {
  curatedProjectIconUrl,
  iconBackdropClass,
} from '../../modules/projects/lib/project-icon-url'

interface ProjectIconProps {
  symbol: string
  name?: string
  /** Curated project slug for local `/icons/{slug}.png` assets. */
  slug?: string
  /** Optional explicit logo URL override. */
  src?: string
  className?: string
  /** Tailwind text-size class for the initials fallback. */
  textClassName?: string
}

/**
 * Renders a curated/local coin logo with a graceful initials fallback so the UI
 * never shows broken images.
 */
export function ProjectIcon({
  symbol,
  name,
  slug,
  src,
  className,
  textClassName,
}: ProjectIconProps) {
  const localUrl = slug ? curatedProjectIconUrl(slug) : undefined
  const candidate = src ?? localUrl
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    setErrored(false)
  }, [candidate])

  if (!candidate || errored) {
    return (
      <span
        className={cn(
          'flex items-center justify-center rounded-full bg-primary/15 font-bold uppercase text-foreground',
          className,
        )}
        aria-label={name ?? symbol}
      >
        <span className={cn('leading-none', textClassName)}>{symbol.slice(0, 3)}</span>
      </span>
    )
  }

  return (
    <img
      src={candidate}
      alt={name ?? symbol}
      loading="lazy"
      draggable={false}
      onError={() => setErrored(true)}
      className={cn('rounded-full object-cover', iconBackdropClass(candidate), className)}
    />
  )
}
