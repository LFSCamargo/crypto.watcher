import { Link } from 'react-router-dom'
import { IN_ANALYSIS_HREF } from '../../../components/layout/navigation'
import { RiArrowRightLine } from '@remixicon/react'
import { Button } from '../../../components/ui'
import { SectionGlow } from './section-glow'

export function CTASection() {
  return (
    <section
      aria-labelledby="cta-title"
      className="relative overflow-hidden border-t border-border"
    >
      <SectionGlow
        spots={[
          { tone: 'amber', at: '50% 60%', size: '36rem 20rem', strength: 0.3 },
          { tone: 'violet', at: '15% 30%', strength: 0.2 },
          { tone: 'teal', at: '85% 80%', strength: 0.18 },
        ]}
      />
      <div className="container-wide section-padding relative">
        <div className="glass-card glass-sheen mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-3xl p-8 text-center md:p-12">
          <h2 id="cta-title" className="heading-2 max-w-2xl text-balance">
            Want a project reviewed by the council?
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Submit a DApp or protocol and the governor council will analyse it and publish
            a structured safety report. Review requests are free during launch; any future
            fee schedule is set through CWT governance.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link to="/app/analysis-request">
                Request a review
                <RiArrowRightLine className="h-5 w-5" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={IN_ANALYSIS_HREF}>See what’s in analysis</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
