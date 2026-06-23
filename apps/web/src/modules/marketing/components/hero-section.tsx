import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiArrowRightLine, RiCheckLine } from '@remixicon/react'
import { HeaderLogo } from '../../../components/brand/header-logo'
import { Button } from '../../../components/ui'
import { ProjectSearch } from '../../projects/components/project-search'
import { getTopRatedProjects } from '../../projects/lib/curated-projects'
import { TopRatedProjectCard } from './top-rated-project-card'

const trustPoints = [
  '100+ projects reviewed',
  'Authority-verified scores',
  'No wallet needed to browse',
]

export function HeroSection() {
  const topRated = getTopRatedProjects(8)

  return (
    <section className="relative overflow-hidden">
      <div className="container-wide relative z-10 pt-16 md:pt-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <HeaderLogo />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-semibold"
          >
            <span className="flex h-2 w-2 rounded-full bg-success" />
            Blockchain risk review company
          </motion.div>

          <motion.h1
            className="heading-1 mb-5 text-balance"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            Is this crypto project{' '}
            <span className="rounded-xl bg-primary px-3 text-primary-foreground">
              safe
            </span>
            ?
          </motion.h1>

          <motion.p
            className="body-large mx-auto mb-8 max-w-xl text-balance"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Search any project and see a clear safety score reviewed by our authority
            panel — before you invest a single dollar.
          </motion.p>

          <motion.div
            className="w-full max-w-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <ProjectSearch placeholder="Try “Bitcoin”, “Uniswap”, “Solana”…" />
          </motion.div>

          <motion.div
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button asChild size="lg" className="gap-2">
              <Link to="/app">
                Browse safe projects
                <RiArrowRightLine className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/app/analysis-request">Request a review</Link>
            </Button>
          </motion.div>

          <motion.ul
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {trustPoints.map((point) => (
              <li
                key={point}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
              >
                <RiCheckLine className="h-4 w-4 text-success" />
                {point}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          className="mt-16 md:mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold">Top rated projects</h2>
              <p className="text-sm text-muted-foreground">
                Top credit ratings from our review authority
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app">View all</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 pb-10">
            {topRated.map((project, index) => (
              <TopRatedProjectCard key={project.slug} project={project} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
