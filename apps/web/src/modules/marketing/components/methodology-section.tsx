import {
  RiFileSearchLine,
  RiShieldCheckLine,
  RiTeamLine,
  RiUserStarLine,
} from '@remixicon/react'
import { Card } from '../../../components/ui'
import { SectionHeading } from './section-heading'

const pillars = [
  {
    icon: RiUserStarLine,
    title: 'Vetted governor council',
    description:
      'Only selected reviewers with demonstrated expertise — smart contract security, protocol design, tokenomics, compliance, infrastructure and on-chain analysis — publish official scores.',
  },
  {
    icon: RiFileSearchLine,
    title: 'Structured, evidence-based reports',
    description:
      'Scores come with findings and risk factors organised by area, so you can see why a project scored the way it did.',
  },
  {
    icon: RiShieldCheckLine,
    title: 'No token-weighted score voting',
    description:
      'Holding CWT never buys influence over a project rating. Review authority and token ownership are deliberately separate.',
  },
  {
    icon: RiTeamLine,
    title: 'Open discussion, expert authority',
    description:
      'Anyone can read reports and join the discussion; the council weighs that input when it publishes the final score.',
  },
]

export function MethodologySection() {
  return (
    <section aria-labelledby="methodology-title" className="border-t border-border">
      <div className="container-wide section-padding">
        <SectionHeading
          id="methodology-title"
          eyebrow="Methodology"
          title="Trust comes from expertise, not popularity"
          description="Crypto Watcher works like a rating agency or security auditor — not a social voting platform."
        />
        <ul className="grid gap-4 md:grid-cols-2">
          {pillars.map((pillar) => (
            <li key={pillar.title}>
              <Card className="h-full p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-foreground">
                  <pillar.icon className="h-5 w-5" aria-hidden />
                </div>
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
