/** Slugs that differ from CoinGecko coin IDs. All other curated slugs use slug as-is. */
export const COINGECKO_ID_OVERRIDES: Record<string, string | null> = {
  xrp: 'ripple',
  bnb: 'binancecoin',
  'near-protocol': 'near',
  havven: 'synthetix',
  marinade: 'marinade-finance',
  walletconnect: 'walletconnect',
  spark: 'spark-2',
  base: null,
  linea: null,
}

export function resolveCoingeckoId(slug: string): string | null {
  if (slug in COINGECKO_ID_OVERRIDES) {
    return COINGECKO_ID_OVERRIDES[slug] ?? null
  }
  return slug
}
