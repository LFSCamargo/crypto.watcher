import { useState } from 'react'
import { RiCoinLine, RiLock2Line } from '@remixicon/react'
import { Button } from '../../../components/ui'
import { cn } from '../../../lib/utils'
import { SpotlightCard } from './spotlight-card'

const SCORE = 82

function statusMessage(attempts: number) {
  if (attempts === 0) return ''
  if (attempts < 3)
    return `Score unchanged at ${SCORE}. Holding CWT never moves a rating.`
  return `Still ${SCORE} after ${attempts} tries. Scores come only from council reports.`
}

export function InfluenceTestCard({ className }: { className?: string }) {
  const [attempts, setAttempts] = useState(0)

  return (
    <SpotlightCard
      tone="coral"
      aria-labelledby="influence-card-title"
      className={cn('flex flex-col gap-5', className)}
    >
      <div className="space-y-2">
        <h3 id="influence-card-title" className="text-xl font-bold">
          Money can’t move a score
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Review authority and token ownership are deliberately separate. Go on, try.
        </p>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 py-6">
        {attempts > 0 && (
          <RiCoinLine
            key={`coin-${attempts}`}
            aria-hidden
            className="absolute top-3 h-7 w-7 animate-coin-drop text-tone-amber"
          />
        )}
        <span
          key={`score-${attempts}`}
          className={cn(
            'flex items-baseline gap-1',
            attempts > 0 && 'animate-shake motion-reduce:animate-none',
          )}
        >
          <span data-score className="text-5xl font-bold tabular-nums">
            {SCORE}
          </span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <RiLock2Line aria-hidden className="h-3.5 w-3.5" />
          Locked to the council report
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        className="gap-2 rounded-full"
        onClick={() => setAttempts((count) => count + 1)}
      >
        <RiCoinLine aria-hidden className="h-4 w-4" />
        Try to buy a better score
      </Button>
      <p role="status" className="min-h-10 text-center text-sm font-medium">
        {statusMessage(attempts)}
      </p>
    </SpotlightCard>
  )
}
