/** Local path for a curated project logo (served from `src/public/icons/`). */
export function curatedProjectIconUrl(slug: string): string {
  return `/icons/${slug}.png`
}
