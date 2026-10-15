import { Link } from 'react-router-dom'
import { RiArrowRightLine, RiCheckLine } from '@remixicon/react'
import { Button } from '../../../components/ui'
import { useSession } from '../../../store/session'
import { ProjectSearch } from '../../projects/components/project-search'
import { ReportPreviewCard } from './report-preview-card'

const trustPoints = [
  'Scores published by a vetted governor council',
  'No wallet needed to browse',
  'Review requests are free during launch',
]

export function HeroSection() {
  const user = useSession((state) => state.user)

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_28rem_at_75%_35%,hsl(var(--primary)/0.28),transparent_70%),radial-gradient(30rem_24rem_at_15%_70%,hsl(var(--chart-2)/0.14),transparent_70%)]"
      />
      <div className="container-wide relative z-10 grid items-center gap-12 pb-16 pt-14 md:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24">
        <div className="flex flex-col items-center text-center animate-in fade-in duration-500 lg:items-start lg:text-left">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/70 px-4 py-1.5 text-sm font-semibold">
            <span aria-hidden className="flex h-2 w-2 rounded-full bg-success" />
            Expert-governed crypto risk reviews
          </p>

          <h1 id="hero-title" className="heading-1 mb-5 text-balance">
            Is this crypto project{' '}
            <span className="rounded-xl bg-primary px-3 text-primary-foreground">
              safe
            </span>
            ?
          </h1>

          <p className="body-large mb-8 max-w-xl text-balance">
            Search a project and read a safety score and structured report from vetted
            reviewers — before you allocate capital.
          </p>

          <div className="w-full max-w-xl">
            <ProjectSearch placeholder="Try “Bitcoin”, “Uniswap”, “Solana”…" />
          </div>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link to="/app">
                Browse projects
                <RiArrowRightLine className="h-5 w-5" aria-hidden />
              </Link>
            </Button>
            {user ? (
              <Button asChild variant="outline" size="lg">
                <Link to="/app/analysis-request">Request a review</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="lg">
                <Link to="/auth/signup">Get started</Link>
              </Button>
            )}
          </div>

          <ul className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {trustPoints.map((point) => (
              <li
                key={point}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
              >
                <RiCheckLine
                  className="h-4 w-4 shrink-0 text-success-strong"
                  aria-hidden
                />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center lg:justify-end">
          <ReportPreviewCard />
        </div>
      </div>
    </section>
  )
}
