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
  if (cached) return cached

  const snapshot = await fetchCoinGeckoMarket(slug, coingeckoId)
  writeLocalMarketCache(slug, snapshot)
  return snapshot
}

export async function fetchProjectMarket(slug: string): Promise<MarketSnapshot> {
  const coingeckoId = resolveCoingeckoId(slug)
  if (!coingeckoId) {
    throw new MarketUnavailableError(
      'This project does not have a tradeable token with public market data.',
    )
  }

  try {
    const response = await apiFetch<MarketSnapshot>(`/market/projects/${slug}`)
    return parseMarketResponse(response)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('API 404')) {
      try {
        return await fetchProjectMarketDirect(slug, coingeckoId)
      } catch {
        throw new MarketUnavailableError()
      }
    }

    if (!isApiUnavailable(error)) {
      throw error
    }

    return fetchProjectMarketDirect(slug, coingeckoId)
  }
}

export const marketApi = {
  project: fetchProjectMarket,
}
