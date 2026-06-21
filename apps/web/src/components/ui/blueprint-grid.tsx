import { cn } from '../../lib/utils'

interface BlueprintGridProps {
  className?: string
  variant?: 'default' | 'dots' | 'lines'
  accent?: boolean
}

export function BlueprintGrid({ className, variant = 'default', accent = false }: BlueprintGridProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {variant === 'default' && (
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="blueprint-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border"
              />
            </pattern>
            <pattern
              id="blueprint-grid-large"
              width="160"
              height="160"
              patternUnits="userSpaceOnUse"
            >
              <rect width="160" height="160" fill="url(#blueprint-grid)" />
              <path
                d="M 160 0 L 0 0 0 160"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-border"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-grid-large)" opacity="0.4" />
        </svg>
      )}

      {variant === 'dots' && (
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="dot-pattern"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="1"
                fill="currentColor"
                className="text-muted-foreground"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-pattern)" opacity="0.3" />
        </svg>
      )}

      {variant === 'lines' && (
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="line-pattern"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="100"
                y2="100"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border"
              />
              <line
                x1="100"
                y1="0"
                x2="0"
                y2="100"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#line-pattern)" opacity="0.2" />
        </svg>
      )}

      {accent && (
        <>
          <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          <div className="absolute right-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          <div className="absolute left-0 top-1/3 h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="absolute left-0 top-2/3 h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </>
      )}
    </div>
  )
}
