import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAutoScrollTape } from '../hooks/use-auto-scroll-tape'
import { ProjectIcon } from '../../../components/brand/project-icon'
import { resolveCreditRatingFromSafetyScore } from '../../../lib/ratings/credit-rating'
import { cn } from '../../../lib/utils'
import {
  curatedProjects,
  sortCuratedProjectsByRating,
} from '../../projects/lib/curated-projects'
import { AssetPreviewHover } from './asset-preview-hover'

const tickerAssets = sortCuratedProjectsByRating(curatedProjects).slice(0, 24)

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

/** Passing tape of reference grades on every screen. The rating ladder is the accessible list. */
export function AssetTicker() {
  const [previewOpen, setPreviewOpen] = useState(false)
  const openCount = useRef(0)
  const tape = useAutoScrollTape(previewOpen)
  const onOpenChange = (open: boolean) => {
    openCount.current = Math.max(0, openCount.current + (open ? 1 : -1))
    setPreviewOpen(openCount.current > 0)
  }

  return (
    <div
      ref={tape.ref}
      data-ticker
      data-preview-open={previewOpen ? 'true' : 'false'}
      aria-hidden="true"
      className="relative overflow-x-auto overscroll-x-contain border-y border-border bg-card/50 py-4 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
    >
      <div className="flex w-max">
        <TickerRow onOpenChange={onOpenChange} />
        <TickerRow onOpenChange={onOpenChange} />
      </div>
    </div>
  )
}
