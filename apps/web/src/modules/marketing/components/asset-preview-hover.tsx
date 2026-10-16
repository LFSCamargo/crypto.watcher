import type { ReactElement } from 'react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../components/ui/hover-card'
import { RadarAssetPreview } from './radar-asset-preview'

type Side = 'top' | 'right' | 'bottom' | 'left'

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
      <HoverCardContent
        side={side}
        className="max-h-[min(34rem,70vh)] w-[22rem] overflow-y-auto"
      >
        <RadarAssetPreview slug={slug} />
      </HoverCardContent>
    </HoverCard>
  )
}
