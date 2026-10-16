import { Link } from 'react-router-dom'
import { RiArrowRightLine, RiSparkling2Line } from '@remixicon/react'
import { IN_ANALYSIS_HREF } from '../../../components/layout/navigation'
import { Button } from '../../../components/ui'
import { Reveal } from './reveal'
import { SectionGlow } from './section-glow'

const floaters = [
  { slug: 'ethereum', className: 'left-[4%] top-[18%] h-12 w-12', delay: '0s' },
  { slug: 'solana', className: 'left-[12%] bottom-[14%] h-10 w-10', delay: '-2s' },
  { slug: 'chainlink', className: 'right-[6%] top-[14%] h-11 w-11', delay: '-4s' },
  { slug: 'aave', className: 'right-[13%] bottom-[18%] h-9 w-9', delay: '-1s' },
  { slug: 'uniswap', className: 'left-[22%] top-[6%] h-8 w-8', delay: '-3s' },
  { slug: 'bitcoin', className: 'right-[24%] bottom-[4%] h-8 w-8', delay: '-5s' },
]

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
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
        {floaters.map((floater) => (
          <img
            key={floater.slug}
            src={`/icons/${floater.slug}.png`}
            alt=""
            loading="lazy"
            className={`absolute animate-float rounded-full opacity-80 shadow-lg ${floater.className}`}
            style={{ animationDelay: floater.delay }}
          />
        ))}
      </div>
      <div className="container-wide section-padding relative">
        <Reveal className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-[2rem] p-[2px] shadow-xl">
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 aspect-square w-[200%] animate-border-spin bg-[conic-gradient(from_0deg,hsl(var(--tone-amber)),hsl(var(--tone-coral)),hsl(var(--tone-violet)),hsl(var(--tone-sky)),hsl(var(--tone-teal)),hsl(var(--tone-amber)))] [transform:translate(-50%,-50%)] motion-reduce:animate-none"
            />
            <div className="relative flex flex-col items-center gap-5 rounded-[calc(2rem-2px)] bg-card p-8 text-center md:p-12">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-tone-teal/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-tone-teal-strong">
                <RiSparkling2Line aria-hidden className="h-3.5 w-3.5" />
                Free during launch
              </span>
              <h2 id="cta-title" className="heading-2 max-w-2xl text-balance">
                Want a project reviewed by the council?
              </h2>
              <p className="max-w-xl text-muted-foreground">
                Submit a DApp or protocol and the governor council will analyse it and
                publish a structured safety report. Any future fee schedule is set through
                CWT governance.
              </p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button asChild size="lg" className="group gap-2">
                  <Link to="/app/analysis-request">
                    Request a review
                    <RiArrowRightLine
                      className="h-5 w-5 transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to={IN_ANALYSIS_HREF}>See what’s in analysis</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
