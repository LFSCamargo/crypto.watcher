import { cn } from '../../lib/utils'

interface ShieldLogoProps {
  className?: string
  showWordmark?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { box: 'h-8 w-8', text: 'text-base' },
  md: { box: 'h-10 w-10', text: 'text-lg' },
  lg: { box: 'h-12 w-12', text: 'text-xl' },
}

export function ShieldLogo({
  className,
  showWordmark = true,
  size = 'md',
}: ShieldLogoProps) {
  const config = sizes[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img
        src="/logo.png"
        alt={showWordmark ? '' : 'Crypto Watcher'}
        className={cn('shrink-0 object-contain', config.box)}
        draggable={false}
      />
      {showWordmark && (
        <span className={cn('font-bold tracking-tight text-foreground', config.text)}>
          Crypto<span className="text-foreground">Watcher</span>
        </span>
      )}
    </div>
  )
}
