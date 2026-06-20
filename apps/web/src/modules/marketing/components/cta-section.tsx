import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from '@phosphor-icons/react'
import { Button } from '../../../components/ui'
import { ProjectSearch } from '../../projects/components/project-search'

export function CTASection() {
  return (
    <section className="relative border-t border-border/50">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container-wide section-padding">
        <motion.div
          className="relative mx-auto flex flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl border border-primary/20 bg-card/50 p-8 text-left backdrop-blur-xl md:p-12 lg:flex-row"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative w-full max-w-2xl">
            <h2 className="heading-2 mb-4 text-gradient">
              Check a project before connecting your wallet
            </h2>

            <p className="body-large mb-6 max-w-xl">
              Search recognized crypto assets and community-reviewed projects first.
              Wallet connection is only needed when you want to vote, comment, or build
              reputation.
            </p>

            <ProjectSearch className="mb-4 max-w-xl" />

            <div className="flex flex-col items-start justify-start gap-4 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link to="/app">
                  Browse Safety Index
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/docs/whitepaper">Read Whitepaper</Link>
              </Button>
            </div>
          </div>
          <motion.img
            src="/logo.png"
            alt="Crypto Watcher shield"
            className="h-72 w-72 object-contain drop-shadow-[0_4px_24px_rgba(245,184,0,0.35)]"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            draggable={false}
          />
        </motion.div>
      </div>
    </section>
  )
}
