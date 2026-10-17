import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { RiPauseLine, RiPlayLine } from '@remixicon/react'
import { Button, type Tone } from '../../../components/ui'
import { cn } from '../../../lib/utils'
import { lifecycleSteps, lifecycleToneColor } from '../lib/lifecycle-steps'
import { LifecycleTrack } from './lifecycle-track'
import { SectionGlow } from './section-glow'
import { SectionHeading } from './section-heading'

const STEP_MS = 4000
const LAST = lifecycleSteps.length - 1

const nodeTone: Record<Tone, string> = {
  amber: 'bg-tone-amber text-foreground ring-tone-amber/30',
  coral: 'bg-tone-coral text-white ring-tone-coral/30',
  violet: 'bg-tone-violet text-white ring-tone-violet/30',
  sky: 'bg-tone-sky text-white ring-tone-sky/30',
  teal: 'bg-tone-teal text-white ring-tone-teal/30',
  pink: 'bg-tone-pink text-white ring-tone-pink/30',
}

const panelTone: Record<Tone, string> = {
  amber: 'text-tone-amber-strong',
  coral: 'text-tone-coral-strong',
  violet: 'text-tone-violet-strong',
  sky: 'text-tone-sky-strong',
  teal: 'text-tone-teal-strong',
  pink: 'text-tone-pink-strong',
}

export function LifecycleSection() {
  const reducedMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(!reducedMotion)
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

  return (
    <section
      aria-labelledby="lifecycle-title"
      className="relative overflow-hidden border-t border-border bg-card/40"
    >
      <SectionGlow
        spots={[
          { tone: 'coral', at: '15% 80%' },
          { tone: 'sky', at: '85% 20%' },
        ]}
      />
      <div className="container-wide section-padding relative">
        <SectionHeading
          id="lifecycle-title"
          eyebrow="How a review works"
          tone="sky"
          title="From request to published score"
          description="Follow a project through the five stages — or pick one to see who does what."
        />

        <div ref={trackRef} className="relative">
          <div className="mb-6 flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="min-h-11 gap-1.5 rounded-full"
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

          <div className="relative">
            <div aria-hidden className="hidden aspect-[20/3] md:block" />
            <LifecycleTrack active={active} />
            <ol
              aria-label="Review lifecycle"
              className="relative z-10 grid gap-3 md:absolute md:inset-0 md:grid-cols-5 md:gap-2"
            >
              {lifecycleSteps.map((item, index) => {
                const reached = index <= active
                const current = index === active
                return (
                  <li
                    key={item.title}
                    className={cn(
                      'relative flex items-center gap-4 rounded-2xl p-3 transition-colors md:h-full md:flex-col md:justify-end md:gap-2 md:bg-transparent md:p-2 md:shadow-none md:ring-0 md:hover:bg-transparent',
                      current
                        ? 'bg-background shadow-sm ring-1 ring-border'
                        : 'hover:bg-background/60',
                    )}
                  >
                    {index < LAST ? (
                      <svg
                        aria-hidden
                        viewBox="0 0 32 64"
                        preserveAspectRatio="none"
                        className="absolute left-5 top-12 h-[calc(100%-1.25rem)] w-8 overflow-visible md:hidden"
                      >
                        <path
                          d="M16 0 C 16 24, 28 24, 16 64"
                          fill="none"
                          stroke={
                            index < active
                              ? lifecycleToneColor(item.tone)
                              : 'hsl(var(--border))'
                          }
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                        />
                        <path
                          d="M11 52 L16 62 L21 52"
                          fill="none"
                          stroke={
                            index < active
                              ? lifecycleToneColor(item.tone)
                              : 'hsl(var(--muted-foreground))'
                          }
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    ) : null}
                    <span
                      aria-hidden
                      className={cn(
                        'relative z-20 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-4 transition-[background-color,transform] duration-[320ms] ease-glass md:hidden',
                        reached
                          ? nodeTone[item.tone]
                          : 'bg-background text-muted-foreground ring-border',
                        current && 'scale-110',
                      )}
                    >
                      {index + 1}
                    </span>
                    <h3
                      className={cn(
                        'font-bold md:w-full md:rounded-2xl md:px-2 md:py-2 md:text-center',
                        current &&
                          'md:bg-background md:shadow-sm md:ring-1 md:ring-border',
                      )}
                    >
                      <button
                        type="button"
                        aria-current={current ? 'step' : undefined}
                        onClick={() => {
                          setActive(index)
                          setPlaying(false)
                        }}
                        className="rounded after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
                      >
                        {item.title}
                      </button>
                    </h3>
                    {current && touring && (
                      <span
                        aria-hidden
                        className="absolute inset-x-4 bottom-1.5 h-0.5 overflow-hidden rounded-full bg-border"
                      >
                        <span
                          key={active}
                          className="block h-full origin-left animate-step-progress bg-foreground/40"
                          style={{ ['--step-duration' as string]: `${STEP_MS}ms` }}
                        />
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>

          <div
            role="region"
            aria-label={`Step ${active + 1} of ${lifecycleSteps.length}: ${step.title}`}
            className="mt-6 overflow-hidden rounded-3xl border border-border bg-background p-6 md:p-8"
          >
            <div
              key={active}
              className="landing-enter grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-center"
            >
              <div className="space-y-2">
                <p
                  className={cn(
                    'text-sm font-bold uppercase tracking-widest',
                    panelTone[step.tone],
                  )}
                >
                  Step {active + 1}
                </p>
                <p className="text-2xl font-bold md:text-3xl">{step.title}</p>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              <dl className="grid gap-3 sm:grid-cols-3">
                {[
                  ['Who acts', step.actor],
                  ['What you see', step.youSee],
                  ['Result', step.result],
                ].map(([term, value]) => (
                  <div key={term} className="rounded-2xl bg-muted/50 p-4">
                    <dt className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {term}
                    </dt>
                    <dd className="text-sm font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
