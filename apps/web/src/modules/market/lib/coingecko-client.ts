import type { MarketSnapshot } from './market.types'
import { buildMarketSnapshot } from './market-snapshot'

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3'
const MARKET_HISTORY_DAYS = 365

type CoinGeckoMarketChart = {
  prices: [number, number][]
}

export async function fetchCoinGeckoMarket(
  slug: string,
  coingeckoId: string,
): Promise<MarketSnapshot> {
  const url = `${COINGECKO_BASE_URL}/coins/${encodeURIComponent(coingeckoId)}/market_chart?vs_currency=usd&days=${MARKET_HISTORY_DAYS}`
  const response = await fetch(url, { headers: { Accept: 'application/json' } })

  if (response.status === 404) {
    throw new Error('Price data is not available for this project')
  }

  if (!response.ok) {
    throw new Error('Unable to fetch market data right now')
  }

  const payload = (await response.json()) as CoinGeckoMarketChart
  if (!Array.isArray(payload.prices) || payload.prices.length === 0) {
    throw new Error('Price data is not available for this project')
  }

  return buildMarketSnapshot(slug, coingeckoId, payload.prices)
}
