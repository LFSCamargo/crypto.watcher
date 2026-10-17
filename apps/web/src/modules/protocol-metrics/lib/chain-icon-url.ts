const CHAIN_ICON_SLUGS: Record<string, string> = {
  Ethereum: 'ethereum',
  BSC: 'bsc',
  'OP Mainnet': 'optimism',
  Optimism: 'optimism',
  Polygon: 'polygon',
  Arbitrum: 'arbitrum',
  Avalanche: 'avax',
  Base: 'base',
  Gnosis: 'xdai',
  'ZKsync Era': 'zksync',
  ZKsync: 'zksync',
  Fantom: 'fantom',
  Celo: 'celo',
  Moonbeam: 'moonbeam',
  Scroll: 'scroll',
  Linea: 'linea',
  Mantle: 'mantle',
  Blast: 'blast',
  Sonic: 'sonic',
  Sei: 'sei',
  Near: 'near',
  Solana: 'solana',
  Bitcoin: 'bitcoin',
  Tron: 'tron',
  Cronos: 'cronos',
  Harmony: 'harmony',
  Metis: 'metis',
  Boba: 'boba',
  Aurora: 'aurora',
  Kava: 'kava',
  Osmosis: 'osmosis',
  Sui: 'sui',
  Aptos: 'aptos',
  Starknet: 'starknet',
  Ronin: 'ronin',
  Unichain: 'unichain',
  Monad: 'monad',
  Hemi: 'hemi',
  World: 'world',
  'World Chain': 'world',
  Taiko: 'taiko',
  Ink: 'ink',
  Plume: 'plume',
  Berachain: 'berachain',
  Hyperliquid: 'hyperliquid',
  'Hyperliquid L1': 'hyperliquid',
}

function normalizeChainSlug(chainName: string): string {
  return chainName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Chains whose DefiLlama icon is unusable. These use the curated logo in
 * `src/public/icons/` instead.
 */
const LOCAL_CHAIN_ICONS: Record<string, string> = {
  Base: 'base',
}

/** Curated chain logo when we have one, otherwise the DefiLlama chain icon. */
export function chainIconUrl(chainName: string): string {
  const localSlug = LOCAL_CHAIN_ICONS[chainName]
  if (localSlug) return `/icons/${localSlug}.png`
  const slug = CHAIN_ICON_SLUGS[chainName] ?? normalizeChainSlug(chainName)
  return `https://icons.llamao.fi/icons/chains/rsz_${slug}.jpg`
}
