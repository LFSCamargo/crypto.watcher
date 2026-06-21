import { motion } from 'framer-motion'
import { RiBarChartBoxLine, RiBuildingLine, RiShieldLine, RiUser3Line } from '@remixicon/react'

const audiences = [
  {
    icon: RiUser3Line,
    title: 'Retail investors',
    description:
      'Get a clear, expert-reviewed signal before committing capital. Know what the real risks are instead of relying on hype or anonymous posts.',
  },
  {
    icon: RiBuildingLine,
    title: 'Institutions & funds',
    description:
      'Access structured, methodology-driven analysis that can support internal due diligence and risk frameworks for crypto allocations.',
  },
  {
    icon: RiShieldLine,
    title: 'Projects & teams',
    description:
      'A high-quality review becomes a credible signal of maturity. Many teams now proactively request reviews to demonstrate they are serious.',
  },
  {
    icon: RiBarChartBoxLine,
    title: 'The broader ecosystem',
    description:
      'Raising the bar on information quality reduces capital misallocation, discourages low-quality or malicious projects, and creates better long-term incentives for builders.',
  },
]

export function EcosystemImpactSection() {
  return (
    <section className="border-t border-border">
      <div className="container-wide section-padding">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[3px] text-muted-foreground">
            Why this matters
          </p>
          <h2 className="heading-2 mb-3">A professional layer of due diligence for crypto</h2>
          <p className="body-large">
            Crypto Watcher exists to reduce the massive information gap that still exists between projects and capital.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {audiences.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-4 rounded-2xl border border-border bg-card p-6"
            >
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="mb-1.5 text-lg font-bold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="mx-auto max-w-3xl text-sm text-muted-foreground">
            Just like credit ratings and security audits became table stakes in traditional finance, we believe expert,
            independent risk reviews will become a baseline expectation in crypto — not optional, and certainly not
            decided by token-weighted popularity contests.
          </p>
        </div>
      </div>
    </section>
  )
}
