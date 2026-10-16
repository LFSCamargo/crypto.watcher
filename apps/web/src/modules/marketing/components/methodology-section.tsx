import { CouncilExpertiseCard } from './council-expertise-card'
import { DiscussionCard } from './discussion-card'
import { InfluenceTestCard } from './influence-test-card'
import { ReportAnatomyCard } from './report-anatomy-card'
import { Reveal } from './reveal'
import { SectionGlow } from './section-glow'
import { SectionHeading } from './section-heading'

export function MethodologySection() {
  return (
    <section
      aria-labelledby="methodology-title"
      className="relative overflow-hidden border-t border-border"
    >
      <SectionGlow
        spots={[
          { tone: 'teal', at: '8% 18%' },
          { tone: 'violet', at: '92% 85%' },
        ]}
      />
      <div className="container-wide section-padding relative">
        <Reveal>
          <SectionHeading
            id="methodology-title"
            eyebrow="Methodology"
            tone="teal"
            title="Trust comes from expertise, not popularity"
            description="Crypto Watcher works like a rating agency or security auditor — not a social voting platform."
          />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-6">
          <Reveal className="md:col-span-4">
            <CouncilExpertiseCard className="h-full" />
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.1}>
            <InfluenceTestCard className="h-full" />
          </Reveal>
          <Reveal className="md:col-span-3" delay={0.05}>
            <ReportAnatomyCard className="h-full" />
          </Reveal>
          <Reveal className="md:col-span-3" delay={0.15}>
            <DiscussionCard className="h-full" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
