import { RiShieldCheckLine } from '@remixicon/react'
import { cn } from '../../lib/utils'

interface ShieldLogoProps {
  className?: string
  showWordmark?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { icon: 18, box: 'h-8 w-8', text: 'text-base' },
  md: { icon: 22, box: 'h-10 w-10', text: 'text-lg' },
  lg: { icon: 28, box: 'h-12 w-12', text: 'text-xl' },
}

export function ShieldLogo({
  className,
  showWordmark = true,
  size = 'md',
}: ShieldLogoProps) {
  const config = sizes[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground',
          config.box,
        )}
      >
        <RiShieldCheckLine size={config.icon} />
      </span>
      {showWordmark && (
        <span className={cn('font-bold tracking-tight text-foreground', config.text)}>
          Crypto<span className="text-primary-strong">Watcher</span>
        </span>
      )}
    </div>
  )
}
