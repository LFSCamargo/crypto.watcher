import {
  loadMarketsProgressively,
  MARKET_CACHE_WARMUP_CONCURRENCY,
} from '../lib/load-markets-progressively'

export type MarketCacheWorkerRequest = {
  slugs: string[]
  apiBase: string
}

export type MarketCacheWorkerSnapshot = {
  type: 'snapshot'
  snapshot: unknown
}

export type MarketCacheWorkerComplete = {
  type: 'complete'
}

export type MarketCacheWorkerResponse = MarketCacheWorkerSnapshot | MarketCacheWorkerComplete

const MARKET_FETCH_TIMEOUT_MS = 20_000

async function fetchSnapshot(apiBase: string, slug: string): Promise<unknown | null> {
  const response = await fetch(`${apiBase}/market/projects/${encodeURIComponent(slug)}`, {
    signal: AbortSignal.timeout(MARKET_FETCH_TIMEOUT_MS),
  })
  if (!response.ok) return null
  return response.json() as Promise<unknown>
}

self.onmessage = async (event: MessageEvent<MarketCacheWorkerRequest>) => {
  const { slugs, apiBase } = event.data
  const failed = new Set(slugs)

  const pull = async (slug: string): Promise<unknown | null> => {
    try {
      const snapshot = await fetchSnapshot(apiBase, slug)
      if (snapshot) failed.delete(slug)
      return snapshot
    } catch {
      return null
    }
  }

  const publish = (snapshot: unknown) => {
    const message: MarketCacheWorkerSnapshot = { type: 'snapshot', snapshot }
    self.postMessage(message)
  }

  await loadMarketsProgressively(slugs, {
    concurrency: MARKET_CACHE_WARMUP_CONCURRENCY,
    fetchSnapshot: pull,
    onSnapshot: publish,
  })

  if (failed.size > 0) {
    await loadMarketsProgressively([...failed], {
      concurrency: MARKET_CACHE_WARMUP_CONCURRENCY,
      fetchSnapshot: pull,
      onSnapshot: publish,
    })
  }

  const done: MarketCacheWorkerComplete = { type: 'complete' }
  self.postMessage(done)
}
