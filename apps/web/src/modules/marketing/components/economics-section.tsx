import { motion } from 'framer-motion'
import {
  RiBankLine,
  RiCoinLine,
  RiFileListLine,
  RiTeamLine,
  RiScalesLine,
} from '@remixicon/react'

const flows = [
  {
    icon: RiFileListLine,
    title: 'Request a review',
    description:
      'Teams, investors or community members pay a review fee to submit a project for analysis by the governor council.',
  },
  {
    icon: RiBankLine,
    title: 'Fees to the treasury',
    description:
      'Review fees are collected by the protocol and flow into the treasury (governed on-chain). This is the primary revenue source today.',
  },
  {
    icon: RiTeamLine,
    title: 'Experts get paid for work',
    description:
      'Governors are compensated from the treasury for completed investigations and published reports. Compensation is for professional effort, not for favorable scores.',
  },
  {
    icon: RiScalesLine,
    title: 'Governed by CWT holders',
    description:
      'CWT token holders vote on fee schedules, compensation parameters, treasury allocations and reviewer policy — never on individual project ratings.',
  },
]

export function EconomicsSection() {
  return (
    <section className="border-t border-border bg-card/40">
      <div className="container-wide section-padding">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[3px] text-muted-foreground">
            Economics
          </p>
          <h2 className="heading-2 mb-3">How the protocol makes money and pays experts</h2>
          <p className="body-large">
            We run a professional service model: those who want high-quality analysis pay a fee. Those fees fund the experts who do the work.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {flows.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-border bg-background p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-background p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <RiCoinLine className="h-5 w-5" />
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Protocol revenue</strong> today comes mainly from review request fees.
                These fees support governor compensation, protocol operations and reserves.
              </p>
              <p>
                The CWT treasury allocation (governed by token holders) is designed to sustain expert review capacity over time,
                including potential grants and whistleblower programs.
              </p>
              <p>
                Importantly, CWT does <strong className="text-foreground">not</strong> give holders the ability to buy influence over any project’s risk score.
                Economics and review authority are deliberately separated.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          All economic parameters (fees, compensation bands, treasury usage) are subject to on-chain governance by CWT holders.
          {' '}
          <a href="/docs/tokenomics" className="font-semibold text-primary hover:underline">Read the full tokenomics</a>.
        </p>
      </div>
    </section>
  )
}
