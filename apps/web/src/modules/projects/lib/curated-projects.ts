export interface CuratedProject {
  slug: string
  name: string
  symbol: string
  rank: number
  score: number
  network: string
  status: 'reference' | 'watch'
  description: string
  sourceUrl: string
}

export const curatedProjects: CuratedProject[] = [
  {
    slug: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    rank: 1,
    score: 96,
    network: 'Bitcoin',
    status: 'reference',
    description:
      'Largest crypto asset by market recognition, used here as a baseline reference for safety checks.',
    sourceUrl: 'https://coinmarketcap.com/currencies/bitcoin/',
  },
  {
    slug: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    rank: 2,
    score: 93,
    network: 'Ethereum',
    status: 'reference',
    description:
      'Major smart-contract network with deep liquidity, broad ecosystem usage, and long operating history.',
    sourceUrl: 'https://coinmarketcap.com/currencies/ethereum/',
  },
  {
    slug: 'bnb',
    name: 'BNB',
    symbol: 'BNB',
    rank: 4,
    score: 87,
    network: 'BNB Chain',
    status: 'reference',
    description:
      'Large exchange-linked ecosystem asset commonly tracked in top market-cap project indexes.',
    sourceUrl: 'https://coinmarketcap.com/currencies/bnb/',
  },
  {
    slug: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    rank: 5,
    score: 86,
    network: 'Solana',
    status: 'reference',
    description:
      'High-throughput smart-contract network with active developer and consumer-app ecosystems.',
    sourceUrl: 'https://coinmarketcap.com/currencies/solana/',
  },
  {
    slug: 'xrp',
    name: 'XRP',
    symbol: 'XRP',
    rank: 6,
    score: 82,
    network: 'XRP Ledger',
    status: 'watch',
    description:
      'Established payments-focused asset with strong market visibility and ongoing regulatory context to monitor.',
    sourceUrl: 'https://coinmarketcap.com/currencies/xrp/',
  },
  {
    slug: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    rank: 10,
    score: 80,
    network: 'Cardano',
    status: 'watch',
    description:
      'Research-oriented smart-contract network included as a recognizable market reference asset.',
    sourceUrl: 'https://coinmarketcap.com/currencies/cardano/',
  },
]

export function filterCuratedProjects(query: string, projects = curatedProjects) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return projects
  }

  return projects.filter((project) =>
    [project.name, project.symbol, project.network, project.description].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    ),
  )
}
