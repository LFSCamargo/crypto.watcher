import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui'
import { curatedProjects } from '../../projects/lib/curated-projects'

export function ReferenceProjectsSection() {
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
            Safety index
          </motion.span>
          <motion.h2
            className="heading-2 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Start with recognizable <span className="text-gradient">market assets</span>
          </motion.h2>
          <motion.p
            className="body-large"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            These CoinMarketCap-style references help users compare community analysis
            against widely tracked projects. They are signals for research, not financial
            advice.
          </motion.p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {curatedProjects.slice(0, 6).map((project, index) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: index * 0.05 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link to={`/app/reference/${project.slug}`} className="group block">
                <Card className="card-hover h-full overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge variant={project.status === 'reference' ? 'success' : 'warning'}>
                          Rank #{project.rank}
                        </Badge>
                        <CardTitle className="mt-3 flex items-center gap-2 text-xl">
                          {project.name}
                          <span className="text-sm font-medium text-muted-foreground">
                            {project.symbol}
                          </span>
                        </CardTitle>
                      </div>
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <ShieldCheck size={20} weight="duotone" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-primary">Safety {project.score}/100</span>
                      <span className="flex items-center gap-1 text-muted-foreground group-hover:text-primary">
                        View details
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
