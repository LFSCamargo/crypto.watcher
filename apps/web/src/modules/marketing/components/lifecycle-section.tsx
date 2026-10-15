import { SectionHeading } from './section-heading'

const steps = [
  {
    title: 'Review requested',
    description: 'Anyone signed in can ask the council to review a project.',
  },
  {
    title: 'In analysis',
    description: 'The request is accepted and appears in the public analysis queue.',
  },
  {
    title: 'Governor review',
    description: 'Council members assess security, design, tokenomics and more.',
  },
  {
    title: 'Report published',
    description: 'Findings and the outcome are published and can be anchored on-chain.',
  },
  {
    title: 'Score shown',
    description: 'The safety score appears on the project page for everyone.',
  },
]

export function LifecycleSection() {
  return (
    <section
      aria-labelledby="lifecycle-title"
      className="border-t border-border bg-card/40"
    >
      <div className="container-wide section-padding">
        <SectionHeading
          id="lifecycle-title"
          eyebrow="How a review works"
          title="From request to published score"
        />
        <ol aria-label="Review lifecycle" className="grid gap-4 md:grid-cols-5">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-border bg-background p-5"
            >
              <span
                aria-hidden
                className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background"
              >
                {index + 1}
              </span>
              <h3 className="mb-1 font-bold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
