/** Local path for a curated project logo (served from `src/public/icons/`). */
export function curatedProjectIconUrl(slug: string): string {
  return `/icons/${slug}.png`
}

/** Logos drawn in black on a transparent background vanish on dark surfaces. */
const LIGHT_BACKDROP_ICONS = new Set(['aptos'])

export function iconBackdropClass(src: string): string | undefined {
  const slug = /\/icons\/([^/]+)\.png$/.exec(src)?.[1]
  return slug && LIGHT_BACKDROP_ICONS.has(slug) ? 'bg-white' : undefined
}
