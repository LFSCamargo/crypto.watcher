import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiAddLine, RiArrowRightLine } from '@remixicon/react'
import { Button } from '../../../components/ui'

export function CTASection() {
  return (
    <section className="border-t border-border">
      <div className="container-wide section-padding">
        <motion.div
          className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-3xl bg-foreground p-10 text-center text-background md:p-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground">
            <RiAddLine className="h-4 w-4" />
            Request a review
          </span>
          <h2 className="heading-2 max-w-2xl">
            Want a project reviewed by our authority panel?
          </h2>
          <p className="max-w-xl text-background/70">
            Submit any DApp or protocol, pay the protocol fee to deploy its voting
            contract, and let our governors publish a safety verdict.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link to="/app/analysis-request">
                Request a review
                <RiArrowRightLine className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-background text-foreground hover:bg-background/90"
            >
              <Link to="/app">Browse projects</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
