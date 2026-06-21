import { motion } from 'framer-motion'
import {
  RiAlertLine,
  RiGroupLine,
  RiMoneyDollarCircleLine,
  RiScalesLine,
} from '@remixicon/react'

const problems = [
  {
    icon: RiAlertLine,
    title: 'Information asymmetry',
    description:
      'Project teams know everything. Retail investors are left guessing from marketing, Twitter threads, and paid influencers.',
  },
  {
    icon: RiMoneyDollarCircleLine,
    title: 'Incentives are broken',
    description:
      'Many "reviews" and ratings are influenced by payments, token allocations, or the desire for engagement. Trust is for sale.',
  },
  {
    icon: RiGroupLine,
    title: 'Crowd wisdom fails here',
    description:
      'Vote-to-rate systems can be gamed through Sybil attacks, coordinated brigading, and large token holders pushing narratives.',
  },
  {
    icon: RiScalesLine,
    title: 'No professional standard',
    description:
      'Unlike traditional finance (credit ratings, security audits, sell-side research), crypto has lacked a trusted, expert-driven layer.',
  },
]

export function ProblemSection() {
  return (
    <section className="border-t border-border">
      <div className="container-wide section-padding">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[3px] text-muted-foreground">
            The reality today
          </p>
          <h2 className="heading-2 mb-3">Crypto is still the wild west of due diligence</h2>
          <p className="body-large">
            Billions flow into projects every cycle with almost no reliable, independent signal about their real risks.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {problems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
