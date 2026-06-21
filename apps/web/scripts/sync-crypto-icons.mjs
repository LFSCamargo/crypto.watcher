/**
 * Downloads coin logos into `src/public/icons/` keyed by curated project slug.
 *
 * Sources (in order):
 * 1. Existing local file (skip)
 * 2. SpotHQ cryptocurrency-icons (by symbol)
 * 3. CoinGecko CDN direct URLs (curated overrides)
 * 4. CoinGecko batch markets API (remaining)
 *
 * Run: pnpm --filter web icons:sync
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicIconsDir = path.resolve(__dirname, '../src/public/icons')
const curatedProjectsPath = path.resolve(__dirname, '../src/modules/projects/lib/curated-projects.ts')

const COINGECKO_ID_OVERRIDES = {
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
  'sonic-3': 'sonic-3',
  avalanche: 'avalanche-2',
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

/** SpotHQ icon filename overrides when symbol differs from repo file name. */
const SPOTHQ_SYMBOL_OVERRIDES = {
  POL: 'matic',
  SKY: 'mkr',
  RENDER: 'rndr',
  FXS: 'frax',
  W: 'wormhole',
}

/** Direct CoinGecko CDN URLs for assets missing from SpotHQ (via batch API when possible). */
const COINGECKO_DIRECT_URLS = {
  'polygon-ecosystem-token':
    'https://coin-images.coingecko.com/coins/images/4713/large/polygon.png',
  morpho: 'https://coin-images.coingecko.com/coins/images/29837/large/Morpho-token-icon.png',
  'jito-governance-token':
    'https://coin-images.coingecko.com/coins/images/33228/large/jto.png',
  'berachain-bera': 'https://coin-images.coingecko.com/coins/images/25235/large/BERA.png',
  pendle: 'https://coin-images.coingecko.com/coins/images/15069/large/Pendle_Logo_Normal-03.png',
  ethena: 'https://coin-images.coingecko.com/coins/images/36530/large/ethena.png',
}

function resolveCoingeckoId(slug) {
  if (Object.prototype.hasOwnProperty.call(COINGECKO_ID_OVERRIDES, slug)) {
    return COINGECKO_ID_OVERRIDES[slug] ?? null
  }
  return slug
}

function spothqUrl(symbol) {
  const file = (SPOTHQ_SYMBOL_OVERRIDES[symbol] ?? symbol).toLowerCase()
  return `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${file}.png`
}

async function readProjects() {
  const source = await fs.readFile(curatedProjectsPath, 'utf8')
  const slugs = [...source.matchAll(/slug: '([^']+)'/g)].map((match) => match[1])
  const symbols = [...source.matchAll(/symbol: '([^']+)'/g)].map((match) => match[1])
  return slugs.map((slug, index) => ({ slug, symbol: symbols[index] }))
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function downloadImage(url, destination) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length < 200) {
    throw new Error('response too small')
  }
  await fs.writeFile(destination, buffer)
}

async function fetchMarkets(coinIds) {
  const params = new URLSearchParams({
    vs_currency: 'usd',
    ids: coinIds.join(','),
    per_page: '250',
    page: '1',
    sparkline: 'false',
  })
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?${params.toString()}`,
  )
  if (!response.ok) {
    throw new Error(`markets API HTTP ${response.status}`)
  }
  return response.json()
}

async function main() {
  await fs.mkdir(publicIconsDir, { recursive: true })
  const projects = await readProjects()
  const manifest = {}
  const pending = []

  for (const { slug, symbol } of projects) {
    const destination = path.join(publicIconsDir, `${slug}.png`)
    if (await fileExists(destination)) {
      manifest[slug] = { source: 'existing', symbol }
      continue
    }

    const directUrl = COINGECKO_DIRECT_URLS[slug]
    if (directUrl) {
      try {
        await downloadImage(directUrl, destination)
        manifest[slug] = { source: 'coingecko-direct', url: directUrl, symbol }
        console.log(`✓ ${slug} (direct)`)
        continue
      } catch (error) {
        console.error(`✗ ${slug} direct: ${error.message}`)
      }
    }

    try {
      await downloadImage(spothqUrl(symbol), destination)
      manifest[slug] = { source: 'spothq', symbol }
      console.log(`✓ ${slug} (spothq/${symbol})`)
      continue
    } catch {
      pending.push({ slug, symbol })
    }
  }

  if (pending.length > 0) {
    console.log(`\nFetching ${pending.length} icons from CoinGecko batch API…`)
    await sleep(5000)
    const coinIds = pending
      .map(({ slug }) => resolveCoingeckoId(slug))
      .filter(Boolean)
    const uniqueIds = [...new Set(coinIds)]

    try {
      const markets = await fetchMarkets(uniqueIds)
      const marketById = new Map(markets.map((coin) => [coin.id, coin]))

      for (const { slug, symbol } of pending) {
        const coinId = resolveCoingeckoId(slug)
        const destination = path.join(publicIconsDir, `${slug}.png`)
        const market = coinId ? marketById.get(coinId) : undefined

        if (!market?.image) {
          console.error(`✗ ${slug}: missing CoinGecko market data`)
          continue
        }

        try {
          await downloadImage(market.image, destination)
          manifest[slug] = { source: 'coingecko-api', coinId, symbol, url: market.image }
          console.log(`✓ ${slug} (coingecko/${coinId})`)
        } catch (error) {
          console.error(`✗ ${slug} download: ${error.message}`)
        }
      }
    } catch (error) {
      console.error(`CoinGecko batch failed: ${error.message}`)
    }
  }

  const downloaded = Object.keys(manifest).length
  await fs.writeFile(
    path.join(publicIconsDir, 'manifest.json'),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), icons: manifest, pending: projects.filter((p) => !manifest[p.slug]).map((p) => p.slug) }, null, 2)}\n`,
  )

  console.log(`\nIcons ready: ${downloaded}/${projects.length}`)
}

main()
