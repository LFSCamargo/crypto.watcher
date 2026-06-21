import { motion } from 'framer-motion'
import {
  RiFileSearchLine,
  RiShieldCheckLine,
  RiTeamLine,
  RiUserStarLine,
} from '@remixicon/react'

const pillars = [
  {
    icon: RiUserStarLine,
    title: 'Vetted governor council',
    description:
      'Only carefully selected experts with proven domain knowledge (smart contract security, protocol design, tokenomics, compliance, infrastructure, on-chain analysis) can publish official scores.',
  },
  {
    icon: RiFileSearchLine,
    title: 'Evidence-based reports',
    description:
      'Every review includes structured findings, risk factors, and cited evidence — not just a number pulled from sentiment.',
  },
  {
    icon: RiShieldCheckLine,
    title: 'No token-weighted voting on scores',
    description:
      'CWT governs the protocol (reviewer selection, methodology, accountability). It does not let people buy influence over individual project ratings.',
  },
  {
    icon: RiTeamLine,
    title: 'Public participation, expert authority',
    description:
      'Anyone can submit evidence, report incidents, and comment. But only the governor council synthesizes it into the final risk score.',
  },
]

export function ExpertReviewsSection() {
  return (
    <section className="border-t border-border bg-card/40">
      <div className="container-wide section-padding">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[3px] text-muted-foreground">
            Our model
          </p>
          <h2 className="heading-2 mb-3">Trust comes from expertise, not popularity</h2>
          <p className="body-large">
            We operate more like a professional rating agency or security auditor than a social voting platform.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="rounded-2xl border border-border bg-background p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <pillar.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-bold">{pillar.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-background p-6 text-center text-sm text-muted-foreground md:p-8">
          <p className="max-w-3xl mx-auto">
            This is the same philosophy that makes people trust security audit firms, credit rating agencies, and
            professional research desks — deep expertise + transparent process, not token ownership or crowd sentiment.
          </p>
        </div>
      </div>
    </section>
  )
}
