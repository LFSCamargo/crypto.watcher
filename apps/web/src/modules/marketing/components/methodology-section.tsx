import {
  RiFileSearchLine,
  RiShieldCheckLine,
  RiTeamLine,
  RiUserStarLine,
} from '@remixicon/react'
import { Card, ToneIcon, type Tone } from '../../../components/ui'
import { SectionGlow } from './section-glow'
import { SectionHeading } from './section-heading'

const pillars: {
  icon: typeof RiUserStarLine
  tone: Tone
  accent: string
  title: string
  description: string
}[] = [
  {
    icon: RiUserStarLine,
    tone: 'violet',
    accent: 'via-tone-violet',
    title: 'Vetted governor council',
    description:
      'Only selected reviewers with demonstrated expertise — smart contract security, protocol design, tokenomics, compliance, infrastructure and on-chain analysis — publish official scores.',
  },
  {
    icon: RiFileSearchLine,
    tone: 'teal',
    accent: 'via-tone-teal',
    title: 'Structured, evidence-based reports',
    description:
      'Scores come with findings and risk factors organised by area, so you can see why a project scored the way it did.',
  },
  {
    icon: RiShieldCheckLine,
    tone: 'coral',
    accent: 'via-tone-coral',
    title: 'No token-weighted score voting',
    description:
      'Holding CWT never buys influence over a project rating. Review authority and token ownership are deliberately separate.',
  },
  {
    icon: RiTeamLine,
    tone: 'sky',
    accent: 'via-tone-sky',
    title: 'Open discussion, expert authority',
    description:
      'Anyone can read reports and join the discussion; the council weighs that input when it publishes the final score.',
  },
]

export function MethodologySection() {
  return (
    <section
      aria-labelledby="methodology-title"
      className="relative overflow-hidden border-t border-border"
    >
      <SectionGlow
        spots={[
          { tone: 'teal', at: '8% 18%' },
          { tone: 'violet', at: '92% 85%' },
        ]}
      />
      <div className="container-wide section-padding relative">
        <SectionHeading
          id="methodology-title"
          eyebrow="Methodology"
          tone="teal"
          title="Trust comes from expertise, not popularity"
          description="Crypto Watcher works like a rating agency or security auditor — not a social voting platform."
        />
        <ul className="grid gap-4 md:grid-cols-2">
          {pillars.map((pillar) => (
            <li key={pillar.title}>
              <Card className="group relative h-full overflow-hidden p-6 transition-transform duration-300 ease-glass hover:-translate-y-1 motion-reduce:transition-none">
                <span
                  aria-hidden
                  className={`absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-100 ${pillar.accent}`}
                />
                <ToneIcon
                  icon={pillar.icon}
                  tone={pillar.tone}
                  size="lg"
                  className="mb-4"
                />
                <h3 className="mb-2 text-lg font-bold">{pillar.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
