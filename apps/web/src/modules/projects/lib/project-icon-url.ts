/** Local path for a curated project logo (served from `src/public/icons/`). */
export function curatedProjectIconUrl(slug: string): string {
  return `/icons/${slug}.png`
}

/** Logos drawn in black on a transparent background vanish on dark surfaces. */
const LIGHT_BACKDROP_ICONS = new Set(['aptos'])

/**
 * Rounded-square marks. They sit on a white circle so the corners stay white
 * instead of being cropped into a solid ball.
 */
const SQUARE_TILE_ICONS = new Set(['base'])

function iconSlug(src: string): string | undefined {
  return /\/icons\/([^/]+)\.png(?:\?.*)?$/.exec(src)?.[1]
}

export function iconBackdropClass(src: string): string | undefined {
  const slug = iconSlug(src)
  if (!slug) return undefined
  if (SQUARE_TILE_ICONS.has(slug)) return 'bg-white'
  return LIGHT_BACKDROP_ICONS.has(slug) ? 'bg-white' : undefined
}
