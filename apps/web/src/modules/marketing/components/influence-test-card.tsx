import { useState } from 'react'
import { RiCoinLine, RiLock2Line } from '@remixicon/react'
import { Button } from '../../../components/ui'
import { cn } from '../../../lib/utils'
import { SpotlightCard } from './spotlight-card'

const SCORE = 82
const RING_RADIUS = 42
const RING_LENGTH = 2 * Math.PI * RING_RADIUS
const FILLED = RING_LENGTH * (SCORE / 100)
const TOSSES = [-40, 0, 40]

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
      tone="amber"
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

      <div
        data-score-dial
        className="relative flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border border-border bg-background/60 py-6"
      >
        <div className="relative flex h-36 w-36 items-center justify-center">
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            className="absolute inset-0 -rotate-90"
          >
            <circle
              cx="50"
              cy="50"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="1.5"
              className="stroke-border"
            />
            <circle
              cx="50"
              cy="50"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${FILLED} ${RING_LENGTH}`}
              className="stroke-primary"
            />
          </svg>
          <span
            key={`hold-${attempts}`}
            aria-hidden
            className={cn(
              'absolute inset-3 rounded-full',
              attempts > 0 && 'animate-score-hold motion-reduce:animate-none',
            )}
          />
          <span className="flex items-baseline gap-0.5">
            <span data-score className="text-5xl font-bold tabular-nums">
              {SCORE}
            </span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </span>
          {attempts > 0 &&
            TOSSES.map((offset, index) => (
              <RiCoinLine
                key={`${attempts}-${offset}`}
                data-coin
                aria-hidden
                className="absolute bottom-1 left-1/2 h-5 w-5 -translate-x-1/2 text-primary animate-coin-deflect motion-reduce:hidden"
                style={{
                  animationDelay: `${index * 80}ms`,
                  ['--toss-x' as string]: `${offset}px`,
                }}
              />
            ))}
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <RiLock2Line aria-hidden className="h-3.5 w-3.5" />
          Locked to the council report
        </span>
      </div>


      <p role="status" className="min-h-10 text-center text-sm font-medium">
        {statusMessage(attempts)}
      </p>
      <Button
        type="button"
        variant="outline"
        className="gap-2 rounded-full"
        onClick={() => setAttempts((count) => count + 1)}
      >
        <RiCoinLine aria-hidden className="h-4 w-4" />
        Try to buy a better score
      </Button>
    </SpotlightCard>
  )
}
