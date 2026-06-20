import { motion, type Variants } from 'framer-motion'
import {
  MagnifyingGlass,
  UsersThree,
  CheckCircle,
  ChartBar,
} from '@phosphor-icons/react'
import { cn } from '../../../lib/utils'

const steps = [
  {
    icon: MagnifyingGlass,
    number: '01',
    title: 'Project Submission',
    description:
      'A project is submitted for analysis and the team deploys a dedicated on-chain voting contract.',
    accent: 'text-primary',
    ring: 'ring-primary/30',
    glow: 'bg-primary/10',
  },
  {
    icon: UsersThree,
    number: '02',
    title: 'Community Analysis',
    description:
      'Eligible users with sufficient reputation comment and share research during the analysis window.',
    accent: 'text-brand-teal',
    ring: 'ring-brand-teal/30',
    glow: 'bg-brand-teal/10',
  },
  {
    icon: CheckCircle,
    number: '03',
    title: 'Weighted Voting',
    description:
      'Verified voters cast votes weighted by reputation — trusted voices carry more influence.',
    accent: 'text-brand-orange',
    ring: 'ring-brand-orange/30',
    glow: 'bg-brand-orange/10',
  },
  {
    icon: ChartBar,
    number: '04',
    title: 'Score Calculation',
    description:
      'When voting ends, the final risk score is computed and permanently recorded on-chain.',
    accent: 'text-primary',
    ring: 'ring-primary/30',
    glow: 'bg-primary/10',
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative border-t border-border/50 bg-card/20">
      <div className="container-wide section-padding">
        <div className="mx-auto max-w-2xl text-center">
          <motion.span
            className="mb-4 inline-block text-sm font-medium text-primary"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.span>
          <motion.h2
            className="heading-2 mb-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            From submission to <span className="text-gradient">final score</span>
          </motion.h2>
          <motion.p
            className="body-large"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Four transparent steps that turn community insight into a trustworthy,
            on-chain risk score.
          </motion.p>
        </div>

        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
            >
              <span
                className={cn(
                  'pointer-events-none absolute -right-4 -top-4 text-7xl font-black text-muted/40 transition-colors duration-300 group-hover:text-muted/60',
                )}
              >
                {step.number}
              </span>

              <div
                className={cn(
                  'relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110',
                  step.glow,
                  step.ring,
                )}
              >
                <step.icon size={26} weight="duotone" className={step.accent} />
              </div>

              <h3 className="relative mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="relative text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
