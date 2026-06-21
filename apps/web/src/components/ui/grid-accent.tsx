import { cn } from '../../lib/utils'

export function GridAccent({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <div className="absolute -left-4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -right-4 top-3/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
    </div>
  )
}
