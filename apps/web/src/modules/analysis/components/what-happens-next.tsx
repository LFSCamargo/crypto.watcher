const steps = [
  'We record your request and add it to the public review queue. Requests are free during launch.',
  'The council triages it: the status moves from Received to Under review.',
  'If accepted, the team adds the project to the catalog and the council analyses it.',
  'An official score appears only when the council publishes its report.',
]

export function WhatHappensNext() {
  return (
    <section
      aria-labelledby="what-happens-next-title"
      className="glass-card-flat space-y-4 p-6"
    >
      <h2 id="what-happens-next-title" className="text-base font-semibold">
        What happens next
      </h2>
      <ol className="space-y-3 text-sm text-muted-foreground">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3">
            <span
              aria-hidden
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary-strong"
            >
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
