import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiCheckLine, RiCoinLine, RiForbidLine, RiLock2Line } from '@remixicon/react'
import { Button } from '../../../components/ui'
import { governanceMilestones } from '../../governance/lib/governance-milestones'
import { Reveal } from './reveal'
import { SectionGlow } from './section-glow'
import { SectionHeading } from './section-heading'

const voted = [
  'Reviewer selection and removal',
  'Review methodology',
  'Accountability and transparency rules',
  'Any future review fee schedule',
]

const neverVoted = ['A project’s safety score', 'The findings in a council report']

const built = governanceMilestones.filter(
  (milestone) => milestone.status === 'done',
).length

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
        <Reveal>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium">
            <span
              aria-hidden
              className="h-2 w-2 animate-pulse rounded-full bg-tone-amber motion-reduce:animate-none"
            />
            Pre-launch · CWT not minted
          </span>
          <SectionHeading
            id="governance-title"
            eyebrow="Protocol governance"
            tone="violet"
            title="Governance, built in from day one"
            align="start"
            description="Once CWT is minted, holders will vote on how the protocol runs — never on individual project scores. Until then, the council and core team decide in the open."
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/app/governance">See governance status</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/docs/governance">How governance will work</Link>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="grid sm:grid-cols-2">
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 animate-float items-center justify-center rounded-full bg-tone-violet/15 text-tone-violet-strong">
                    <RiCoinLine aria-hidden className="h-5 w-5" />
                  </span>
                  <h3 className="font-bold">CWT will vote on</h3>
                </div>
                <ul className="space-y-2.5">
                  {voted.map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <RiCheckLine
                        aria-hidden
                        className="mt-0.5 h-4 w-4 shrink-0 text-success-strong"
                      />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4 border-t border-dashed border-border bg-destructive/5 p-6 sm:border-l sm:border-t-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15 text-destructive-strong">
                    <RiLock2Line aria-hidden className="h-5 w-5" />
                  </span>
                  <h3 className="font-bold">Never on a vote</h3>
                </div>
                <ul className="space-y-2.5">
                  {neverVoted.map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <RiForbidLine
                        aria-hidden
                        className="mt-0.5 h-4 w-4 shrink-0 text-destructive-strong"
                      />
                      {item}
                    </motion.li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground">
                  Scores come only from governor council reports.
                </p>
              </div>
            </div>
            <div className="space-y-2 border-t border-border p-6">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Governance milestones</span>
                <span className="text-muted-foreground">
                  {built} of {governanceMilestones.length} built
                </span>
              </div>
              <div className="flex gap-1.5" aria-hidden>
                {governanceMilestones.map((milestone, index) => (
                  <motion.span
                    key={milestone.title}
                    className={
                      milestone.status === 'done'
                        ? 'h-2 flex-1 origin-left rounded-full bg-tone-teal'
                        : milestone.status === 'next'
                          ? 'h-2 flex-1 origin-left rounded-full bg-tone-amber/60'
                          : 'h-2 flex-1 origin-left rounded-full bg-muted'
                    }
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.08, duration: 0.5 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
