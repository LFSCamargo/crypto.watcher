/** How many market requests the warmup may have in flight at once. */
export const MARKET_CACHE_WARMUP_CONCURRENCY = 3

/**
 * Fetch market snapshots a few at a time.
 * O(n) requests with a fixed concurrency cap, so a full catalog cannot stampede the API.
 */
export async function loadMarketsProgressively(
  slugs: readonly string[],
  options: {
    concurrency?: number
    fetchSnapshot: (slug: string) => Promise<unknown | null>
    onSnapshot: (snapshot: unknown) => void
  },
): Promise<void> {
  const concurrency = Math.max(1, options.concurrency ?? MARKET_CACHE_WARMUP_CONCURRENCY)
  let cursor = 0

  async function run(): Promise<void> {
    while (cursor < slugs.length) {
      const slug = slugs[cursor]
      cursor += 1
      if (!slug) continue

      try {
        const snapshot = await options.fetchSnapshot(slug)
        if (snapshot) options.onSnapshot(snapshot)
      } catch {
        // One asset failing leaves the others free to finish.
      }
    }
  }

  const runners = Math.min(concurrency, slugs.length)
  if (runners === 0) return
  await Promise.all(Array.from({ length: runners }, () => run()))
}
