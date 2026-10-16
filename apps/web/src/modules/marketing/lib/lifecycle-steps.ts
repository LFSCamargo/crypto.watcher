import type { Tone } from '../../../components/ui'

export const lifecycleToneColor = (tone: Tone): string =>
  ({
    amber: 'hsl(var(--tone-amber))',
    coral: 'hsl(var(--tone-coral))',
    violet: 'hsl(var(--tone-violet))',
    sky: 'hsl(var(--tone-sky))',
    teal: 'hsl(var(--tone-teal))',
    pink: 'hsl(var(--tone-pink))',
  })[tone]

export interface LifecycleStep {
  title: string
  tone: Tone
  description: string
  actor: string
  youSee: string
  result: string
}

export const lifecycleSteps: LifecycleStep[] = [
  {
    title: 'Review requested',
    tone: 'amber',
    description: 'Anyone signed in can ask the council to review a project.',
    actor: 'Any signed-in member',
    youSee: 'Your request marked “Received” in the public queue',
    result: 'A free request the council can triage',
  },
  {
    title: 'In analysis',
    tone: 'coral',
    description: 'The request is accepted and appears in the public analysis queue.',
    actor: 'Core team and council',
    youSee: 'The project listed under “In analysis”',
    result: 'Scope and available evidence are confirmed',
  },
  {
    title: 'Governor review',
    tone: 'violet',
    description: 'Council members assess security, design, tokenomics and more.',
    actor: 'Vetted governors',
    youSee: 'Status “Governor review” on the project page',
    result: 'Findings per area; conflicted reviewers sit out',
  },
  {
    title: 'Report published',
    tone: 'sky',
    description: 'Findings and the outcome are published and can be anchored on-chain.',
    actor: 'Governor council',
    youSee: 'The full structured report',
    result: 'A report hash that can be verified on-chain',
  },
  {
    title: 'Score shown',
    tone: 'teal',
    description: 'The safety score appears on the project page for everyone.',
    actor: 'Everyone',
    youSee: 'An official score with its meaning and provenance',
    result: 'A decision you can make with evidence',
  },
]
