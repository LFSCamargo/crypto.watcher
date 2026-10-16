import { Link } from 'react-router-dom'
import { RiCheckLine, RiCloseLine, RiGovernmentLine } from '@remixicon/react'
import { Button, Card, ToneIcon } from '../../../components/ui'
import { SectionGlow } from './section-glow'
import { SectionHeading } from './section-heading'

const governs = [
  'Reviewer selection and removal',
  'Review methodology',
  'Accountability and transparency rules',
  'Any future review fee schedule',
]

export function GovernanceSection() {
  return (
    <section
      aria-labelledby="governance-title"
      className="relative overflow-hidden border-t border-border bg-card/40"
    >
      <SectionGlow
        spots={[
          { tone: 'violet', at: '85% 50%', size: '40rem 30rem', strength: 0.2 },
          { tone: 'sky', at: '5% 90%' },
        ]}
      />
      <div className="container-wide section-padding relative grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading
            id="governance-title"
            eyebrow="Protocol governance"
            tone="violet"
            title="Governed by CWT holders"
            align="start"
            description="CWT holders vote on how the protocol runs — never on individual project scores."
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/app/governance">View proposals</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/docs/governance">How governance works</Link>
            </Button>
          </div>
        </div>
        <Card className="relative overflow-hidden p-6 ring-1 ring-tone-violet/25">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-tone-violet via-tone-sky to-tone-teal"
          />
          <div className="mb-4 flex items-center gap-3">
            <ToneIcon icon={RiGovernmentLine} tone="violet" />
            <h3 className="font-bold">What token holders decide</h3>
          </div>
          <ul className="space-y-3">
            {governs.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <RiCheckLine
                  className="mt-0.5 h-4 w-4 shrink-0 text-success-strong"
                  aria-hidden
                />
                {item}
              </li>
            ))}
            <li className="flex items-start gap-2 border-t border-border pt-3 text-sm">
              <RiCloseLine
                className="mt-0.5 h-4 w-4 shrink-0 text-destructive-strong"
                aria-hidden
              />
              <span>
                <span className="font-semibold">Not decided by vote:</span> a project’s
                safety score — that is the council’s responsibility.
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </section>
  )
}
