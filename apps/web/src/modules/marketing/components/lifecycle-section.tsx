import type { Tone } from '../../../components/ui'
import { SectionGlow } from './section-glow'
import { SectionHeading } from './section-heading'

const stepTones: Record<Tone, string> = {
  amber: 'from-tone-amber/25 to-tone-amber/5 ring-tone-amber/40 text-tone-amber-strong',
  coral: 'from-tone-coral/25 to-tone-coral/5 ring-tone-coral/40 text-tone-coral-strong',
  violet:
    'from-tone-violet/25 to-tone-violet/5 ring-tone-violet/40 text-tone-violet-strong',
  sky: 'from-tone-sky/25 to-tone-sky/5 ring-tone-sky/40 text-tone-sky-strong',
  teal: 'from-tone-teal/25 to-tone-teal/5 ring-tone-teal/40 text-tone-teal-strong',
  pink: 'from-tone-pink/25 to-tone-pink/5 ring-tone-pink/40 text-tone-pink-strong',
}

const steps: { title: string; description: string; tone: Tone }[] = [
  {
    title: 'Review requested',
    tone: 'amber',
    description: 'Anyone signed in can ask the council to review a project.',
  },
  {
    title: 'In analysis',
    tone: 'coral',
    description: 'The request is accepted and appears in the public analysis queue.',
  },
  {
    title: 'Governor review',
    tone: 'violet',
    description: 'Council members assess security, design, tokenomics and more.',
  },
  {
    title: 'Report published',
    tone: 'sky',
    description: 'Findings and the outcome are published and can be anchored on-chain.',
  },
  {
    title: 'Score shown',
    tone: 'teal',
    description: 'The safety score appears on the project page for everyone.',
  },
]

export function LifecycleSection() {
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
        />
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-9 hidden h-0.5 rounded-full bg-gradient-to-r from-tone-amber via-tone-violet to-tone-teal opacity-60 md:block"
          />
          <ol
            aria-label="Review lifecycle"
            className="relative grid gap-4 md:grid-cols-5"
          >
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="relative rounded-2xl border border-border bg-background p-5 transition-transform duration-300 ease-glass hover:-translate-y-1 motion-reduce:transition-none"
              >
                <span
                  aria-hidden
                  className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold ring-1 ring-inset ${stepTones[step.tone]}`}
                >
                  {index + 1}
                </span>
                <h3 className="mb-1 font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
