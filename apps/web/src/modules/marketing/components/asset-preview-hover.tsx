import { useEffect, useState, type ReactElement } from 'react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../components/ui/hover-card'
import { RadarAssetPreview } from './radar-asset-preview'

type Side = 'top' | 'right' | 'bottom' | 'left'

type Thumb = { height: number; top: number }

function readThumb(element: HTMLElement): Thumb | null {
  const { scrollTop, scrollHeight, clientHeight } = element
  if (scrollHeight <= clientHeight + 1) return null
  const height = Math.max((clientHeight / scrollHeight) * 100, 16)
  const top = (scrollTop / (scrollHeight - clientHeight)) * (100 - height)
  return { height, top }
}

function useScrollThumb(element: HTMLDivElement | null) {
  const [thumb, setThumb] = useState<Thumb | null>(null)

  useEffect(() => {
    if (!element) return

    const measure = () => {
      const next = readThumb(element)
      setThumb((current) =>
        current?.height === next?.height && current?.top === next?.top ? current : next,
      )
    }
    measure()
    element.addEventListener('scroll', measure, { passive: true })
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(element)
    if (element.firstElementChild) observer?.observe(element.firstElementChild)
    return () => {
      element.removeEventListener('scroll', measure)
      observer?.disconnect()
    }
  }, [element])

  return thumb
}

function PreviewBody({ slug }: { slug: string }) {
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null)
  const thumb = useScrollThumb(scroller)

  return (
    <div className="relative">
      <div
        ref={setScroller}
        data-preview-scroll
        className="max-h-[min(20rem,46vh)] overflow-y-auto px-5 py-5"
      >
        <RadarAssetPreview slug={slug} />
      </div>
      {thumb ? (
        <div
          aria-hidden
          data-scroll-indicator
          className="pointer-events-none absolute inset-y-3 right-1.5 w-1 rounded-full bg-foreground/10"
        >
          <div
            className="absolute inset-x-0 rounded-full bg-foreground/50"
            style={{ height: `${thumb.height}%`, top: `${thumb.top}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}

/** Same glass preview the radar chips open, anchored to any landing coin. */
export function AssetPreviewHover({
  slug,
  side = 'bottom',
  onOpenChange,
  children,
}: {
  slug: string
  side?: Side
  onOpenChange?: (open: boolean) => void
  children: ReactElement
}) {
  return (
    <HoverCard openDelay={120} closeDelay={120} onOpenChange={onOpenChange}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent side={side} className="w-[22rem] overflow-hidden p-0">
        <PreviewBody slug={slug} />
      </HoverCardContent>
    </HoverCard>
  )
}
