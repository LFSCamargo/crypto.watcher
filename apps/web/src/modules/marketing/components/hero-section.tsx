import { Link } from 'react-router-dom'
import { RiArrowRightLine, RiCheckLine, RiSearchLine } from '@remixicon/react'
import { Button } from '../../../components/ui'
import { useCommandPaletteStore } from '../../../store/command-palette'
import { useSession } from '../../../store/session'
import { HeroRadar } from './hero-radar'
import { ReportPreviewCard } from './report-preview-card'
import { SectionGlow } from './section-glow'

const trustPoints = [
  'Scores published by a vetted governor council',
  'No wallet needed to browse',
  'Review requests are free during launch',
]

export function HeroSection() {
  const user = useSession((state) => state.user)
  const openSearch = useCommandPaletteStore((state) => state.setOpen)

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <SectionGlow
        spots={[
          { tone: 'amber', at: '75% 35%', size: '40rem 28rem', strength: 0.28 },
          { tone: 'sky', at: '12% 75%', size: '30rem 24rem', strength: 0.16 },
          { tone: 'violet', at: '98% 95%', size: '30rem 22rem', strength: 0.18 },
          { tone: 'pink', at: '45% 5%', size: '26rem 16rem', strength: 0.1 },
        ]}
      />
      <div className="container-wide relative z-10 grid items-center gap-12 pb-28 pt-14 md:pb-16 md:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24">
        <div className="flex flex-col items-center text-center landing-enter lg:items-start lg:text-left">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/70 px-4 py-1.5 text-sm font-semibold">
            <span aria-hidden className="flex h-2 w-2 rounded-full bg-success" />
            Expert-governed crypto risk reviews
          </p>

          <h1 id="hero-title" className="heading-1 mb-5 text-balance">
            Is this crypto project{' '}
            <span className="relative isolate inline-block px-3 text-primary-foreground">
              <span
                aria-hidden
                className="absolute inset-0 -z-10 origin-left animate-highlight-draw rounded-xl bg-primary motion-reduce:animate-none"
              />
              safe
            </span>
            ?
          </h1>

          <p className="body-large mb-8 max-w-xl text-balance">
            Search a project and read a safety score and structured report from vetted
            reviewers — before you allocate capital.
          </p>

          <button
            type="button"
            onClick={() => openSearch(true)}
            aria-keyshortcuts="Meta+K Control+K"
            className="flex h-14 w-full max-w-xl items-center gap-3 rounded-full border border-foreground/10 bg-background/80 px-5 text-left text-muted-foreground shadow-sm transition-[border-color,box-shadow] duration-[240ms] ease-glass hover:border-tone-amber/60 hover:shadow-[0_0_0_4px_hsl(var(--tone-amber)/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <RiSearchLine className="h-5 w-5 shrink-0 text-foreground" aria-hidden />
            <span className="flex-1 truncate">
              Search a project — try Bitcoin, Uniswap or Solana
            </span>
            <kbd
              aria-hidden
              className="hidden rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-semibold sm:inline-flex"
            >
              ⌘K
            </kbd>
          </button>

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

        <div
          data-hero-stage
          className="relative hidden justify-center lg:flex lg:justify-end"
        >
          <div className="relative w-full max-w-md">
            <HeroRadar />
            <ReportPreviewCard />
          </div>
        </div>
      </div>
    </section>
  )
}
