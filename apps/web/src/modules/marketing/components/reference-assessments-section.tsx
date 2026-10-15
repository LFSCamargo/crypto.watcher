import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui'
import { getTopRatedProjects } from '../../projects/lib/curated-projects'
import { ReferenceAssessmentLink } from './reference-assessment-link'
import { SectionHeading } from './section-heading'

export function ReferenceAssessmentsSection() {
  const projects = getTopRatedProjects(4)

  return (
    <section aria-labelledby="references-title" className="border-t border-border">
      <div className="container-wide section-padding">
        <SectionHeading
          id="references-title"
          eyebrow="Explore"
          title="Reference assessments"
          description="Curated summaries of widely used assets, compiled from public sources. They are not council reports — official scores appear on a project once the council publishes."
        />
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {projects.map((project) => (
            <li key={project.slug}>
              <ReferenceAssessmentLink project={project} />
            </li>
          ))}
        </ul>
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/app">See all projects</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
