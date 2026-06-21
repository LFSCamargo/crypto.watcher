import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiSearchLine,
  RiShieldCheckLine,
  RiThumbUpLine,
} from '@remixicon/react'
import { projectCategories } from '../../projects/lib/curated-projects'

const steps = [
  {
    icon: RiSearchLine,
    title: 'Search a project',
    description: 'Look up any token, protocol or DApp you are considering.',
  },
  {
    icon: RiShieldCheckLine,
    title: 'Read the safety score',
    description: 'See an authority-reviewed score, thesis and any red flags.',
  },
  {
    icon: RiThumbUpLine,
    title: 'Decide with confidence',
    description: 'Invest, use or skip — backed by transparent review notes.',
  },
]

export function ValueSection() {
  return (
    <section className="border-t border-border bg-card/40">
      <div className="container-wide section-padding">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="heading-2 mb-3">Check before you invest</h2>
          <p className="body-large">
            Three simple steps between you and a safer crypto decision.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-border bg-background p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="mb-1 text-xs font-bold text-muted-foreground">
                STEP {index + 1}
              </p>
              <h3 className="mb-1 text-lg font-bold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12">
          <p className="mb-4 text-center text-sm font-semibold text-muted-foreground">
            Browse by category
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(projectCategories).map(([id, label]) => (
              <Link
                key={id}
                to={`/app?category=${id}`}
                className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:border-foreground/30 hover:bg-secondary"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
