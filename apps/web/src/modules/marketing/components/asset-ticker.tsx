import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAutoScrollTape } from '../hooks/use-auto-scroll-tape'
import { ProjectIcon } from '../../../components/brand/project-icon'
import { resolveCreditRatingFromSafetyScore } from '../../../lib/ratings/credit-rating'
import { cn } from '../../../lib/utils'
import {
  curatedProjects,
  projectCategories,
  sortCuratedProjectsByRating,
} from '../../projects/lib/curated-projects'
import { AssetPreviewHover } from './asset-preview-hover'

const tickerAssets = sortCuratedProjectsByRating(curatedProjects).slice(0, 24)
const bannerAssets = tickerAssets.slice(0, 10)

function BannerCarousel() {
  return (
    <div className="border-y border-border bg-card/40 py-4 md:hidden">
      <ul
        aria-label="Reference banners"
        className="mx-auto flex max-w-full snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none]"
      >
        {bannerAssets.map((project) => {
          const rating = resolveCreditRatingFromSafetyScore(project.score)
          return (
            <li key={project.slug} className="w-[min(78%,18rem)] shrink-0 snap-center">
              <Link
                to={`/app/reference/${project.slug}`}
                aria-label={`${project.name} reference assessment`}
                className="glass-card flex items-center gap-3 rounded-3xl px-3 py-3"
              >
                <ProjectIcon
                  symbol={project.symbol}
                  name={project.name}
                  slug={project.slug}
                  className="h-11 w-11"
                />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate font-semibold">{project.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {project.symbol} · {projectCategories[project.category]}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-bold tabular-nums">{project.score}</span>
                  <span className="text-xs font-bold text-muted-foreground">
                    {rating.sp}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function TickerRow({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  return (
    <ul className="flex shrink-0 gap-3 pr-3">
      {tickerAssets.map((project) => {
        const rating = resolveCreditRatingFromSafetyScore(project.score)
        const investment = rating.group === 'investment_grade'
        return (
          <li key={project.slug}>
            <AssetPreviewHover slug={project.slug} side="top" onOpenChange={onOpenChange}>
              <Link
                to={`/app/reference/${project.slug}`}
                tabIndex={-1}
                draggable={false}
                className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-border bg-background/80 py-1.5 pl-1.5 pr-3 text-sm transition-[border-color,transform] duration-[160ms] ease-glass hover:-translate-y-0.5 hover:border-foreground/30"
              >
                <ProjectIcon
                  symbol={project.symbol}
                  name={project.name}
                  slug={project.slug}
                  className="h-7 w-7"
                />
                <span className="font-semibold">{project.name}</span>
                <span className="text-muted-foreground">{project.score}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-bold',
                    investment
                      ? 'bg-tone-teal/15 text-tone-teal-strong'
                      : 'bg-tone-amber/15 text-tone-amber-strong',
                  )}
                >
                  {rating.sp}
                </span>
              </Link>
            </AssetPreviewHover>
          </li>
        )
      })}
    </ul>
  )
}

/** Mouse-only tape of reference grades; the rating ladder offers the accessible version. */
export function AssetTicker() {
  const [previewOpen, setPreviewOpen] = useState(false)
  const openCount = useRef(0)
  const tape = useAutoScrollTape(previewOpen)
  const onOpenChange = (open: boolean) => {
    openCount.current = Math.max(0, openCount.current + (open ? 1 : -1))
    setPreviewOpen(openCount.current > 0)
  }

  return (
    <>
      <BannerCarousel />
      <div
        ref={tape.ref}
        data-ticker
        data-preview-open={previewOpen ? 'true' : 'false'}
        aria-hidden="true"
        className="relative hidden overflow-x-auto overscroll-x-contain border-y border-border bg-card/50 py-4 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] md:block"
      >
        <div className="flex w-max">
          <TickerRow onOpenChange={onOpenChange} />
          <TickerRow onOpenChange={onOpenChange} />
        </div>
      </div>
    </>
  )
}
