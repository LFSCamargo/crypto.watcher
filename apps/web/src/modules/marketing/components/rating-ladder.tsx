import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { RiArrowRightLine } from '@remixicon/react'
import { ProjectIcon } from '../../../components/brand/project-icon'
import {
  CREDIT_RATING_SCALE,
  getCreditRatingGroupLabel,
  resolveCreditRatingGroup,
  type SpCreditRating,
} from '../../../lib/ratings/credit-rating'
import { cn } from '../../../lib/utils'
import {
  curatedProjects,
  projectCategories,
  type CuratedProject,
} from '../../projects/lib/curated-projects'
import { buildGradeLadder } from '../lib/grade-ladder'

type Category = CuratedProject['category']

const categoryCounts = Object.entries(
  curatedProjects.reduce<Partial<Record<Category, number>>>((counts, project) => {
    counts[project.category] = (counts[project.category] ?? 0) + 1
    return counts
  }, {}),
).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0)) as [Category, number][]

const PREVIEW_LIMIT = 6

function gradeRange(grade: SpCreditRating) {
  const index = CREDIT_RATING_SCALE.findIndex((step) => step.sp === grade)
  const min = CREDIT_RATING_SCALE[index]?.minSafetyScore ?? 0
  const max =
    index === 0 ? 100 : (CREDIT_RATING_SCALE[index - 1]?.minSafetyScore ?? 101) - 1
  return `${min}–${max}`
}

export function RatingLadder() {
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [selected, setSelected] = useState<SpCreditRating>('AAA')
  const chartRef = useRef<HTMLDivElement>(null)
  const grown = useInView(chartRef, { once: true, amount: 0.3 })

  const ladder = useMemo(() => {
    const visible =
      category === 'all'
        ? curatedProjects
        : curatedProjects.filter((project) => project.category === category)
    return buildGradeLadder(curatedProjects, visible)
  }, [category])

  const max = Math.max(1, ...ladder.map((rung) => rung.projects.length))
  const rung =
    ladder.find((item) => item.grade === selected && item.projects.length > 0) ??
    [...ladder].reverse().find((item) => item.projects.length > 0)
  const catalogHref = category === 'all' ? '/app' : `/app?category=${category}`

  return (
    <div className="space-y-6">
      <div
        role="group"
        aria-label="Filter reference assets by category"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
      >
        {[['all', curatedProjects.length] as const, ...categoryCounts].map(
          ([key, count]) => (
            <button
              key={key}
              type="button"
              aria-pressed={category === key}
              onClick={() => setCategory(key)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                category === key
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background hover:border-foreground/40',
              )}
            >
              {key === 'all' ? 'All' : projectCategories[key]}
              <span className="text-xs opacity-70">{count}</span>
            </button>
          ),
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div
          ref={chartRef}
          className="rounded-3xl border border-border bg-card p-5 md:p-6"
        >
          <div
            role="group"
            aria-label="Reference assets by grade"
            className="flex h-72 items-end gap-2 md:gap-4"
          >
            {ladder.map((item) => {
              const count = item.projects.length
              const investment =
                resolveCreditRatingGroup(item.grade) === 'investment_grade'
              const isSelected = rung?.grade === item.grade
              const height = grown && count > 0 ? Math.max(8, (count / max) * 100) : 0
              return (
                <button
                  key={item.grade}
                  type="button"
                  aria-label={`${item.grade}: ${count} assets`}
                  aria-pressed={isSelected}
                  disabled={count === 0}
                  onClick={() => setSelected(item.grade)}
                  className="group flex h-full flex-1 flex-col items-center justify-end gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
                >
                  <span aria-hidden className="flex -space-x-2">
                    {item.projects.slice(0, 3).map((project) => (
                      <ProjectIcon
                        key={project.slug}
                        symbol={project.symbol}
                        name={project.name}
                        slug={project.slug}
                        className="h-6 w-6 ring-2 ring-card transition-transform group-hover:-translate-y-0.5"
                      />
                    ))}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      'relative flex w-full max-w-16 items-start justify-center rounded-t-xl bg-gradient-to-t pt-1.5 text-xs font-bold transition-[height,filter,box-shadow] duration-700 ease-glass',
                      investment
                        ? 'from-tone-teal to-tone-sky'
                        : 'from-tone-coral to-tone-amber',
                      isSelected
                        ? 'shadow-[0_0_0_3px_hsl(var(--background)),0_0_0_5px_hsl(var(--foreground)/0.6)]'
                        : 'opacity-70 group-hover:opacity-100',
                    )}
                    style={{ height: `${height}%` }}
                  >
                    {count > 0 && grown && (
                      <span className="rounded-full bg-background/90 px-1.5 text-foreground">
                        {count}
                      </span>
                    )}
                  </span>
                  <span aria-hidden className="text-sm font-bold">
                    {item.grade}
                  </span>
                </button>
              )
            })}
          </div>
          <div
            aria-hidden
            className="mt-3 flex justify-between text-xs text-muted-foreground"
          >
            <span>← Speculative grade</span>
            <span>Investment grade →</span>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
          {rung && (
            <motion.div
              key={`${category}-${rung.grade}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <p className="text-3xl font-bold">{rung.grade}</p>
                <p className="text-sm text-muted-foreground">
                  {getCreditRatingGroupLabel(resolveCreditRatingGroup(rung.grade))} ·{' '}
                  {rung.projects.length === 1
                    ? '1 asset'
                    : `${rung.projects.length} assets`}{' '}
                  · scores {gradeRange(rung.grade)}
                </p>
              </div>
              <ul aria-label={`${rung.grade} assets`} className="space-y-1.5">
                {rung.projects.slice(0, PREVIEW_LIMIT).map((project) => (
                  <li key={project.slug}>
                    <Link
                      to={`/app/reference/${project.slug}`}
                      aria-label={`${project.name} reference assessment`}
                      className="group flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ProjectIcon
                        symbol={project.symbol}
                        name={project.name}
                        slug={project.slug}
                        className="h-9 w-9"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">
                          {project.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {project.symbol} · {projectCategories[project.category]}
                        </span>
                      </span>
                      <span className="font-bold tabular-nums">{project.score}</span>
                      <RiArrowRightLine
                        aria-hidden
                        className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to={catalogHref}
                className="inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
              >
                {rung.projects.length > PREVIEW_LIMIT
                  ? `${rung.projects.length - PREVIEW_LIMIT} more in the catalog`
                  : 'Browse the catalog'}
                <RiArrowRightLine aria-hidden className="h-4 w-4" />
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
