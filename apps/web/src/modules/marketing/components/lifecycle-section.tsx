import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiPauseLine,
  RiPlayLine,
} from '@remixicon/react'
import { Button } from '../../../components/ui'
import { cn } from '../../../lib/utils'
import { lifecycleSteps } from '../lib/lifecycle-steps'
import { SectionGlow } from './section-glow'
import { SectionHeading } from './section-heading'

const STEP_MS = 4000
const LAST = lifecycleSteps.length - 1

export function LifecycleSection() {
  const reducedMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const inView = useInView(trackRef, { amount: 0.4 })
  const touring = playing && inView && !reducedMotion

  useEffect(() => {
    if (!touring) return
    const timer = window.setTimeout(
      () => setActive((step) => (step === LAST ? 0 : step + 1)),
      STEP_MS,
    )
    return () => window.clearTimeout(timer)
  }, [touring, active])

  const step = lifecycleSteps[active] ?? lifecycleSteps[0]!
  const selectStep = (index: number) => {
    setActive(index)
    setPlaying(false)
  }

  return (
    <section
      aria-labelledby="lifecycle-title"
      className="relative overflow-hidden border-t border-border bg-card/40"
    >
      <SectionGlow spots={[{ tone: 'sky', at: '85% 30%' }]} />
      <div className="container-wide section-padding relative">
        <SectionHeading
          id="lifecycle-title"
          eyebrow="How a review works"
          tone="sky"
          title="From request to published score"
          description="Five stages. A clear trail of evidence. See how a project becomes an expert-reviewed report."
        />
        <div
          ref={trackRef}
          className="overflow-hidden rounded-3xl border border-border bg-card"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 md:px-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              The review process
            </p>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="min-h-11 shrink-0 gap-2 rounded-full"
              disabled={!!reducedMotion}
              onClick={() => setPlaying((value) => !value)}
            >
              {playing && !reducedMotion ? (
                <RiPauseLine aria-hidden className="h-4 w-4" />
              ) : (
                <RiPlayLine aria-hidden className="h-4 w-4" />
              )}
              {playing && !reducedMotion ? 'Pause tour' : 'Play tour'}
            </Button>
          </div>
          <ol
            aria-label="Review lifecycle"
            className="grid grid-cols-5 gap-2 border-b border-border bg-muted/20 p-4 md:gap-3 md:p-6"
          >
            {lifecycleSteps.map((item, index) => (
              <li key={item.title} className="min-w-0">
                <button
                  type="button"
                  aria-label={item.title}
                  aria-current={index === active ? 'step' : undefined}
                  aria-controls="lifecycle-detail"
                  onClick={() => selectStep(index)}
                  className={cn(
                    'relative flex min-h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none lg:min-h-16 lg:justify-start',
                    index === active
                      ? 'border-tone-sky/40 bg-tone-sky/10 text-tone-sky-strong'
                      : 'border-transparent text-muted-foreground hover:border-border hover:bg-background',
                  )}
                >
                  <span aria-hidden className="font-mono text-sm font-semibold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="hidden text-sm font-semibold leading-snug lg:block">
                    {item.title}
                  </span>
                  {index === active && touring && (
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-tone-sky/15"
                    >
                      <span
                        key={active}
                        className="block h-full origin-left animate-step-progress bg-tone-sky"
                        style={{ ['--step-duration' as string]: `${STEP_MS}ms` }}
                      />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ol>
          <div
            id="lifecycle-detail"
            role="region"
            aria-label={`Step ${active + 1} of ${lifecycleSteps.length}: ${step.title}`}
            className="grid gap-8 p-6 md:min-h-72 md:grid-cols-2 md:items-center md:gap-12 md:p-10"
          >
            <div>
              <p className="mb-4 font-mono text-xs font-medium uppercase tracking-widest text-tone-sky-strong">
                Step {String(active + 1).padStart(2, '0')} / 05
              </p>
              <h3 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl">
                {step.title}
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                {step.description}
              </p>
            </div>
            <dl className="divide-y divide-border">
              {[
                ['Who acts', step.actor],
                ['What you see', step.youSee],
                ['Result', step.result],
              ].map(([term, value]) => (
                <div
                  key={term}
                  className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <dt className="pt-0.5 text-xs font-medium text-muted-foreground">
                    {term}
                  </dt>
                  <dd className="text-sm leading-relaxed">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-3 md:px-8">
            <p className="text-xs text-muted-foreground">
              {active + 1} of {lifecycleSteps.length} stages
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Previous stage"
                className="h-11 w-11 rounded-full"
                disabled={active === 0}
                onClick={() => selectStep(active - 1)}
              >
                <RiArrowLeftLine aria-hidden className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Next stage"
                className="h-11 w-11 rounded-full"
                disabled={active === LAST}
                onClick={() => selectStep(active + 1)}
              >
                <RiArrowRightLine aria-hidden className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
