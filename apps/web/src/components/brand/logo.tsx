import { cn } from '../../lib/utils'

interface LogoProps {
  className?: string
  showWordmark?: boolean
  wordmarkClassName?: string
}

const sizeToClass = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-20 w-20',
}

export function Logo({
  className,
  showWordmark = true,
  wordmarkClassName,
  size = 'md',
}: LogoProps & { size?: keyof typeof sizeToClass }) {
  return (
    <span className="flex items-center gap-2.5">
      <img
        src="/logo.png"
        alt="Crypto Watcher"
        className={cn(sizeToClass[size], 'object-contain', className)}
        draggable={false}
      />
      {showWordmark && (
        <span className={cn('text-2xl font-bold tracking-tight', wordmarkClassName)}>
          Crypto<span className="text-primary">Watcher</span>
        </span>
      )}
    </span>
  )
}
