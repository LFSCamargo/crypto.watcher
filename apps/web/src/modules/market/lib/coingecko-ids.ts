/** Slugs that differ from CoinGecko coin IDs. `null` = no CoinGecko listing. */
export const COINGECKO_ID_OVERRIDES: Record<string, string | null> = {
  xrp: 'ripple',
  bnb: 'binancecoin',
  'near-protocol': 'near',
  havven: 'havven',
  marinade: 'marinade',
  walletconnect: 'connect-token-wct',
  maple: 'syrup',
  spark: 'spark-2',
  base: 'base',
  linea: 'linea',
  avalanche: 'avalanche-2',
  'sonic-3': 'sonic-3',
  'crypto-com-chain': 'crypto-com-chain',
  'dydx-chain': 'dydx-chain',
  'frax-share': 'frax-share',
  'ondo-finance': 'ondo-finance',
  'render-token': 'render-token',
  'akash-network': 'akash-network',
  'injective-protocol': 'injective-protocol',
  'sei-network': 'sei-network',
  'berachain-bera': 'berachain-bera',
  'hedera-hashgraph': 'hedera-hashgraph',
  'internet-computer': 'internet-computer',
  'the-open-network': 'the-open-network',
  'jupiter-exchange-solana': 'jupiter-exchange-solana',
  'jito-governance-token': 'jito-governance-token',
  'pancakeswap-token': 'pancakeswap-token',
  'compound-governance-token': 'compound-governance-token',
  'curve-dao-token': 'curve-dao-token',
  'ethereum-name-service': 'ethereum-name-service',
  'pyth-network': 'pyth-network',
  'the-graph': 'the-graph',
  'polygon-ecosystem-token': 'polygon-ecosystem-token',
  'lido-dao': 'lido-dao',
  'rocket-pool': 'rocket-pool',
  'convex-finance': 'convex-finance',
  'stargate-finance': 'stargate-finance',
  'hop-protocol': 'hop-protocol',
  'across-protocol': 'across-protocol',
  layerzero: 'layerzero',
  livepeer: 'livepeer',
  'bitcoin-cash': 'bitcoin-cash',
  'usd-coin': 'usd-coin',
}

export function resolveCoingeckoId(slug: string): string | null {
  if (slug in COINGECKO_ID_OVERRIDES) {
    return COINGECKO_ID_OVERRIDES[slug] ?? null
  }
  return slug
}
