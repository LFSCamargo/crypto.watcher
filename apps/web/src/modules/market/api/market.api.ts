import { apiFetch } from '../../../lib/api/client'
import { fetchCoinGeckoMarket } from '../lib/coingecko-client'
import { resolveCoingeckoId } from '../lib/coingecko-ids'
import { isApiUnavailable, MarketUnavailableError } from '../lib/market-errors'
import { readLocalMarketCache, writeLocalMarketCache } from '../lib/market-local-cache'
import { normalizeMarketSnapshot } from '../lib/normalize-market-snapshot'
import type { MarketSnapshot } from '../lib/market.types'

function parseMarketResponse(raw: unknown): MarketSnapshot {
  const snapshot = normalizeMarketSnapshot(raw)
  if (!snapshot) {
    throw new Error('Invalid market data response')
  }
  return snapshot
}

async function fetchProjectMarketDirect(slug: string, coingeckoId: string): Promise<MarketSnapshot> {
  const cached = readLocalMarketCache(slug)
  if (cached && !cached.stale) return cached

  try {
    const snapshot = await fetchCoinGeckoMarket(slug, coingeckoId)
    writeLocalMarketCache(slug, snapshot)
    return snapshot
  } catch (error) {
    if (cached) return { ...cached, stale: true }
    throw error
  }
}

export async function fetchProjectMarket(slug: string): Promise<MarketSnapshot> {
  const coingeckoId = resolveCoingeckoId(slug)
  if (!coingeckoId) {
    throw new MarketUnavailableError(
      'This project does not have a tradeable token with public market data.',
    )
  }

  const cached = readLocalMarketCache(slug)
  if (cached && !cached.stale) return cached

  try {
    const response = await apiFetch<MarketSnapshot>(`/market/projects/${slug}`)
    const snapshot = parseMarketResponse(response)
    writeLocalMarketCache(slug, snapshot)
    return snapshot
  } catch (error) {
    if (cached) return { ...cached, stale: true }

    const apiMissing = error instanceof Error && error.message.startsWith('API 404')
    if (apiMissing || isApiUnavailable(error)) {
      try {
        return await fetchProjectMarketDirect(slug, coingeckoId)
      } catch (directError) {
        if (apiMissing) throw new MarketUnavailableError()
        throw directError
      }
    }

    throw error
  }
}

export const marketApi = {
  project: fetchProjectMarket,
}
