export type MetricsEntityType = 'protocol' | 'chain'

export interface MetricsTarget {
  type: MetricsEntityType
  id: string
}

/** Curated slugs with no DeFi Llama protocol or chain TVL feed. */
export const METRICS_UNAVAILABLE_SLUGS = new Set([
  'walletconnect',
  'render-token',
  'akash-network',
])

/** Prefer chain DeFi TVL (not protocol entity) for network-native assets. */
export const CHAIN_PRIMARY_SLUGS = new Set([
  'bitcoin',
  'ethereum',
  'solana',
  'avalanche',
  'stellar',
  'xrp',
  'cardano',
  'polkadot',
  'cosmos',
  'near-protocol',
  'tezos',
  'algorand',
  'arbitrum',
  'base',
  'optimism',
  'starknet',
  'zksync',
  'linea',
  'scroll',
  'polygon-ecosystem-token',
  'bnb',
  'aptos',
  'sui',
  'injective-protocol',
  'sei-network',
  'berachain-bera',
  'fantom',
  'sonic-3',
  'gnosis',
  'celo',
  'moonbeam',
  'kusama',
  'flow',
  'hedera-hashgraph',
  'internet-computer',
  'the-open-network',
  'crypto-com-chain',
  'kava',
  'osmosis',
  'litecoin',
  'bitcoin-cash',
  'dogecoin',
  'zcash',
  'monero',
  'ronin',
  'mantle',
  'blast',
  'celestia',
])

/** Curated slug → DeFi Llama chain name for `/v2/historicalChainTvl/{chain}`. */
export const CHAIN_ID_OVERRIDES: Record<string, string> = {
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum',
  solana: 'Solana',
  avalanche: 'Avalanche',
  stellar: 'Stellar',
  xrp: 'Ripple',
  cardano: 'Cardano',
  polkadot: 'Polkadot',
  cosmos: 'Cosmos',
  'near-protocol': 'Near',
  tezos: 'Tezos',
  algorand: 'Algorand',
  arbitrum: 'Arbitrum',
  base: 'Base',
  optimism: 'Optimism',
  starknet: 'Starknet',
  zksync: 'zkSync Era',
  linea: 'Linea',
  scroll: 'Scroll',
  'polygon-ecosystem-token': 'Polygon',
  bnb: 'BSC',
  aptos: 'Aptos',
  sui: 'Sui',
  'injective-protocol': 'Injective',
  'sei-network': 'Sei',
  'berachain-bera': 'Berachain',
  fantom: 'Fantom',
  'sonic-3': 'Sonic',
  gnosis: 'Gnosis',
  celo: 'Celo',
  moonbeam: 'Moonbeam',
  kusama: 'Kusama',
  flow: 'Flow',
  'hedera-hashgraph': 'Hedera',
  'internet-computer': 'ICP',
  'the-open-network': 'Ton',
  'crypto-com-chain': 'Cronos',
  kava: 'Kava',
  osmosis: 'Osmosis',
  litecoin: 'Litecoin',
  'bitcoin-cash': 'Bitcoin Cash',
  dogecoin: 'Dogecoin',
  zcash: 'Zcash',
  monero: 'Monero',
  ronin: 'Ronin',
  mantle: 'Mantle',
  blast: 'Blast',
  celestia: 'Celestia',
  filecoin: 'Filecoin',
}

/** Curated slug → DeFi Llama protocol slug for `/protocol/{id}`. */
export const PROTOCOL_ID_OVERRIDES: Record<string, string> = {
  'lido-dao': 'lido',
  'compound-governance-token': 'compound-v3',
  'curve-dao-token': 'curve-dex',
  'pancakeswap-token': 'pancakeswap',
  'jupiter-exchange-solana': 'jupiter',
  'jito-governance-token': 'jito',
  havven: 'synthetix',
  'frax-share': 'frax',
  'dydx-chain': 'dydx',
  marinade: 'marinade-finance',
  'ether-fi': 'ether.fi',
  sky: 'sky',
  spark: 'spark',
  'usd-coin': 'circle-usdc',
  'ethereum-name-service': 'ens',
  'injective-protocol': 'injective',
  'hedera-hashgraph': 'hedera',
  'the-open-network': 'ton',
  'berachain-bera': 'berachain',
}

function dedupeTargets(targets: MetricsTarget[]): MetricsTarget[] {
  const seen = new Set<string>()
  return targets.filter((target) => {
    const key = `${target.type}:${target.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function metricsTargetKey(target: MetricsTarget): string {
  return `${target.type}:${target.id}`
}

export function resolveMetricsTargets(slug: string): MetricsTarget[] {
  if (METRICS_UNAVAILABLE_SLUGS.has(slug)) return []

  const chainId = CHAIN_ID_OVERRIDES[slug]
  const protocolId = PROTOCOL_ID_OVERRIDES[slug] ?? slug
  const candidates: MetricsTarget[] = []

  if (CHAIN_PRIMARY_SLUGS.has(slug) && chainId) {
    candidates.push({ type: 'chain', id: chainId })
  }

  candidates.push({ type: 'protocol', id: protocolId })

  if (!CHAIN_PRIMARY_SLUGS.has(slug) && chainId) {
    candidates.push({ type: 'chain', id: chainId })
  }

  return dedupeTargets(candidates)
}

/** @deprecated Use resolveMetricsTargets instead. */
export function resolveDefillamaSlug(slug: string): string | null {
  const targets = resolveMetricsTargets(slug)
  const first = targets[0]
  return first ? metricsTargetKey(first) : null
}
