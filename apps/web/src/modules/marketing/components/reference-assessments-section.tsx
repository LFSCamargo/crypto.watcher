import { curatedProjects } from '../../projects/lib/curated-projects'
import { RatingLadder } from './rating-ladder'
import { Reveal } from './reveal'
import { SectionGlow } from './section-glow'
import { SectionHeading } from './section-heading'

export function ReferenceAssessmentsSection() {
  return (
    <section
      aria-labelledby="references-title"
      className="relative overflow-hidden border-t border-border"
    >
      <SectionGlow
        spots={[
          { tone: 'amber', at: '50% 0%', size: '44rem 22rem', strength: 0.2 },
          { tone: 'pink', at: '95% 90%' },
        ]}
      />
      <div className="container-wide section-padding relative">
        <Reveal>
          <SectionHeading
            id="references-title"
            eyebrow="Explore"
            title="Reference assessments"
            description={`See where ${curatedProjects.length} widely used assets land on the rating scale. These summaries are compiled from public sources and are not council reports — official scores appear once the council publishes.`}
          />
        </Reveal>
        <Reveal delay={0.1}>
          <RatingLadder />
        </Reveal>
      </div>
    </section>
  )
}
