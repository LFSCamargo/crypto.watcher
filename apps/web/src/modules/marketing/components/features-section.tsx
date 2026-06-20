import { motion } from 'framer-motion'
import {
  Scales,
  Coins,
  ShieldCheck,
  ChartPieSlice,
  Lightning,
  Lock,
} from '@phosphor-icons/react'

const features = [
  {
    icon: Scales,
    title: 'Reputation-Weighted Voting',
    description:
      'Votes are weighted by user reputation. The more trustworthy you are, the more influence your vote carries in the final score.',
    color: 'text-primary',
    bg: 'bg-primary/10 group-hover:bg-primary/20',
  },
  {
    icon: Coins,
    title: 'Governance Token',
    description:
      'Earn governance tokens by participating. Use them to vote on protocol changes and shape the future of Crypto Watcher.',
    color: 'text-brand-orange',
    bg: 'bg-brand-orange/10 group-hover:bg-brand-orange/20',
  },
  {
    icon: ShieldCheck,
    title: 'Eligibility Requirements',
    description:
      'Not everyone can vote. Users must meet reputation thresholds to participate, ensuring quality analysis.',
    color: 'text-brand-teal',
    bg: 'bg-brand-teal/10 group-hover:bg-brand-teal/20',
  },
  {
    icon: ChartPieSlice,
    title: 'Per-Project Contracts',
    description:
      'Each project gets its own smart contract for voting. Transparent, auditable, and tamper-proof.',
    color: 'text-brand-teal',
    bg: 'bg-brand-teal/10 group-hover:bg-brand-teal/20',
  },
  {
    icon: Lightning,
    title: 'Real-Time Scoring',
    description:
      'Watch scores update in real-time as votes come in. Track sentiment changes throughout the voting period.',
    color: 'text-primary',
    bg: 'bg-primary/10 group-hover:bg-primary/20',
  },
  {
    icon: Lock,
    title: 'Immutable Records',
    description:
      'All votes and scores are stored on-chain. Once recorded, the history cannot be altered or deleted.',
    color: 'text-brand-orange',
    bg: 'bg-brand-orange/10 group-hover:bg-brand-orange/20',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export function FeaturesSection() {
  return (
    <section className="relative border-t border-border/50">
      <div className="container-wide section-padding">
        <div className="mx-auto max-w-2xl text-center">
          <motion.span
            className="mb-4 inline-block text-sm font-medium text-primary"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Features
          </motion.span>
          <motion.h2
            className="heading-2 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Everything you need for{' '}
            <span className="text-gradient">informed decisions</span>
          </motion.h2>
          <motion.p
            className="body-large"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            A comprehensive toolkit for analyzing crypto project risk through
            community-driven, reputation-weighted voting.
          </motion.p>
        </div>

        <motion.div
          className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative">
                <div
                  className={`mb-4 inline-flex rounded-lg p-3 transition-colors duration-300 ${feature.bg} ${feature.color}`}
                >
                  <feature.icon size={24} weight="duotone" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
