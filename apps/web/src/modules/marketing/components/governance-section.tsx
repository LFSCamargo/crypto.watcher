import { Link } from 'react-router-dom'
import { RiCheckLine, RiCloseLine } from '@remixicon/react'
import { Button, Card } from '../../../components/ui'
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
      className="border-t border-border bg-card/40"
    >
      <div className="container-wide section-padding grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading
            id="governance-title"
            eyebrow="Protocol governance"
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
        <Card className="p-6">
          <h3 className="mb-4 font-bold">What token holders decide</h3>
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
