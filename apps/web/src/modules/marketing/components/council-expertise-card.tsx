import { motion } from 'framer-motion'
import { RiShieldStarLine } from '@remixicon/react'
import type { Tone } from '../../../components/ui'
import { cn } from '../../../lib/utils'
import { SpotlightCard } from './spotlight-card'

const areas: { label: string; tone: Tone }[] = [
  { label: 'Smart contract security', tone: 'sky' },
  { label: 'Protocol design', tone: 'violet' },
  { label: 'Tokenomics', tone: 'amber' },
  { label: 'Compliance', tone: 'teal' },
  { label: 'Infrastructure', tone: 'coral' },
  { label: 'On-chain analysis', tone: 'pink' },
]

const chipTone: Record<Tone, string> = {
  amber: 'border-tone-amber/40 bg-tone-amber/10 text-tone-amber-strong',
  coral: 'border-tone-coral/40 bg-tone-coral/10 text-tone-coral-strong',
  violet: 'border-tone-violet/40 bg-tone-violet/10 text-tone-violet-strong',
  sky: 'border-tone-sky/40 bg-tone-sky/10 text-tone-sky-strong',
  teal: 'border-tone-teal/40 bg-tone-teal/10 text-tone-teal-strong',
  pink: 'border-tone-pink/40 bg-tone-pink/10 text-tone-pink-strong',
}

export function CouncilExpertiseCard({ className }: { className?: string }) {
  return (
    <SpotlightCard
      tone="violet"
      aria-labelledby="council-card-title"
      className={cn('flex flex-col gap-6 md:flex-row md:items-center', className)}
    >
      <div className="space-y-3 md:w-2/5">
        <h3 id="council-card-title" className="text-xl font-bold">
          Vetted governor council
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Only selected reviewers with demonstrated expertise publish official scores. No
          anonymous crowd, no popularity contest.
        </p>
      </div>
      <div className="relative flex-1 md:h-72">
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 hidden h-56 w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-tone-violet/40 md:block"
        />
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 hidden h-36 w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-border md:block"
        />
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 hidden h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tone-violet/15 blur-2xl md:block"
        />
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-gradient-to-br from-tone-violet to-tone-sky text-white shadow-lg ring-4 ring-background md:flex"
        >
          <RiShieldStarLine className="h-8 w-8" />
        </span>
        <ul
          aria-label="Review expertise"
          className="flex flex-wrap justify-center gap-2 md:block"
        >
          {areas.map((area, index) => {
            const angle = (index / areas.length) * 2 * Math.PI - Math.PI / 2
            return (
              <li
                key={area.label}
                className="md:absolute md:left-[var(--orbit-x)] md:top-[var(--orbit-y)] md:-translate-x-1/2 md:-translate-y-1/2"
                style={{
                  ['--orbit-x' as string]: `${50 + Math.cos(angle) * 40}%`,
                  ['--orbit-y' as string]: `${50 + Math.sin(angle) * 40}%`,
                }}
              >
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, scale: 0.4 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.15 + index * 0.08,
                    type: 'spring',
                    stiffness: 260,
                  }}
                >
                  <span
                    className={cn(
                      'inline-block animate-float whitespace-nowrap rounded-full border bg-background px-3 py-1 text-xs font-semibold shadow-sm',
                      chipTone[area.tone],
                    )}
                    style={{ animationDelay: `${index * -0.9}s` }}
                  >
                    {area.label}
                  </span>
                </motion.span>
              </li>
            )
          })}
        </ul>
      </div>
    </SpotlightCard>
  )
}
