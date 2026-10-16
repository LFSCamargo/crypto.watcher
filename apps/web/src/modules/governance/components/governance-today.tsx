import {
  RiCommunityLine,
  RiShieldCheckLine,
  RiSettings3Line,
  RiForbidLine,
} from '@remixicon/react'
import { ToneIcon, type Tone } from '../../../components/ui'

const deciders: {
  icon: typeof RiShieldCheckLine
  tone: Tone
  title: string
  description: string
}[] = [
  {
    icon: RiShieldCheckLine,
    tone: 'violet',
    title: 'Governor council',
    description:
      'Vetted reviewers analyse projects and publish official scores and reports.',
  },
  {
    icon: RiSettings3Line,
    tone: 'sky',
    title: 'Core team',
    description:
      'Maintains the reviewer roster and methodology until CWT voting opens, and announces changes on the blog and in the docs.',
  },
  {
    icon: RiCommunityLine,
    tone: 'teal',
    title: 'Community',
    description:
      'Requests reviews, shares evidence and discusses projects. None of this needs a token.',
  },
]

const cwtScope = [
  'Who sits on the reviewer council',
  'Methodology versions and scoring rules',
  'Review fees and treasury use',
  'Accountability and conflict-of-interest rules',
]

export function GovernanceToday() {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section
        aria-labelledby="governance-today-title"
        className="glass-card-flat space-y-5 rounded-3xl p-6 lg:col-span-3"
      >
        <div className="space-y-1">
          <h2 id="governance-today-title" className="text-xl font-semibold">
            Who decides today
          </h2>
          <p className="text-sm text-muted-foreground">
            Until CWT exists, protocol decisions are made off-chain and in the open.
          </p>
        </div>
        <ul className="space-y-4">
          {deciders.map((decider) => (
            <li key={decider.title} className="flex gap-3">
              <ToneIcon icon={decider.icon} tone={decider.tone} />
              <div>
                <h3 className="font-semibold">{decider.title}</h3>
                <p className="text-sm text-muted-foreground">{decider.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="cwt-scope-title"
        className="glass-card-flat space-y-5 rounded-3xl p-6 lg:col-span-2"
      >
        <div className="space-y-1">
          <h2 id="cwt-scope-title" className="text-xl font-semibold">
            What CWT will govern
          </h2>
          <p className="text-sm text-muted-foreground">Protocol policy, once minted.</p>
        </div>
        <ul className="space-y-2 text-sm">
          {cwtScope.map((item) => (
            <li key={item} className="flex gap-2">
              <span
                aria-hidden
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tone-violet"
              />
              {item}
            </li>
          ))}
        </ul>
        <p className="flex gap-2 rounded-2xl bg-destructive/10 p-3 text-sm">
          <RiForbidLine
            aria-hidden
            className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
          />
          <span>
            <span className="font-semibold">Never on a token vote:</span> project scores.
            Those come only from council reports.
          </span>
        </p>
      </section>
    </div>
  )
}
