/**
 * Downloads coin logos into `src/public/icons/` keyed by curated project slug.
 *
 * Primary source: CoinGecko batch markets API (official logos).
 * Fallbacks: SpotHQ cryptocurrency-icons, Trust Wallet assets.
 *
 * Run: pnpm --filter web icons:sync
 * Force refresh all: pnpm --filter web icons:sync -- --force
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicIconsDir = path.resolve(__dirname, '../src/public/icons')
const curatedProjectsPath = path.resolve(__dirname, '../src/modules/projects/lib/curated-projects.ts')
const forceRefresh = process.argv.includes('--force')

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

const SPOTHQ_SYMBOL_OVERRIDES = {
  POL: 'matic',
  SKY: 'mkr',
  RENDER: 'rndr',
  FXS: 'frax',
  W: 'wormhole',
}

const TRUSTWALLET_BY_SLUG = {
  marinade:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey/logo.png',
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
  if (buffer.length < 100) {
    throw new Error('response too small')
  }
  await fs.writeFile(destination, buffer)
}

async function fetchMarkets(coinIds) {
  const chunks = []
  for (let index = 0; index < coinIds.length; index += 50) {
    chunks.push(coinIds.slice(index, index + 50))
  }

  const markets = []
  for (const chunk of chunks) {
    const params = new URLSearchParams({
      vs_currency: 'usd',
      ids: chunk.join(','),
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
    markets.push(...(await response.json()))
    if (chunks.length > 1) {
      await sleep(1500)
    }
  }
  return markets
}

async function downloadWithFallbacks(slug, symbol, destination) {
  const coinId = resolveCoingeckoId(slug)
  const errors = []

  if (coinId) {
    try {
      const markets = await fetchMarkets([coinId])
      const imageUrl = markets[0]?.image
      if (imageUrl) {
        await downloadImage(imageUrl, destination)
        return { source: 'coingecko-api', coinId, url: imageUrl }
      }
    } catch (error) {
      errors.push(`coingecko: ${error.message}`)
    }
  }

  const trustwalletUrl = TRUSTWALLET_BY_SLUG[slug]
  if (trustwalletUrl) {
    try {
      await downloadImage(trustwalletUrl, destination)
      return { source: 'trustwallet', url: trustwalletUrl }
    } catch (error) {
      errors.push(`trustwallet: ${error.message}`)
    }
  }

  try {
    await downloadImage(spothqUrl(symbol), destination)
    return { source: 'spothq', symbol }
  } catch (error) {
    errors.push(`spothq: ${error.message}`)
  }

  throw new Error(errors.join('; '))
}

async function main() {
  await fs.mkdir(publicIconsDir, { recursive: true })
  const projects = await readProjects()
  const manifest = {}
  const failures = []

  const coinIds = [...new Set(projects.map(({ slug }) => resolveCoingeckoId(slug)).filter(Boolean))]
  let marketById = new Map()

  try {
    console.log(`Fetching CoinGecko metadata for ${coinIds.length} coins…`)
    const markets = await fetchMarkets(coinIds)
    marketById = new Map(markets.map((coin) => [coin.id, coin]))
    console.log(`CoinGecko returned ${markets.length} coin images`)
  } catch (error) {
    console.warn(`CoinGecko batch prefetch failed: ${error.message}`)
  }

  for (const { slug, symbol } of projects) {
    const destination = path.join(publicIconsDir, `${slug}.png`)
    const exists = await fileExists(destination)

    if (exists && !forceRefresh) {
      manifest[slug] = { source: 'existing', symbol }
      continue
    }

    const coinId = resolveCoingeckoId(slug)
    const market = coinId ? marketById.get(coinId) : undefined

    try {
      if (market?.image) {
        await downloadImage(market.image, destination)
        manifest[slug] = { source: 'coingecko-api', coinId, symbol, url: market.image }
        console.log(`✓ ${slug} (${coinId})`)
        continue
      }

      const result = await downloadWithFallbacks(slug, symbol, destination)
      manifest[slug] = { ...result, symbol }
      console.log(`✓ ${slug} (${result.source})`)
    } catch (error) {
      failures.push({ slug, symbol, reason: error.message })
      console.error(`✗ ${slug}: ${error.message}`)
    }

    await sleep(100)
  }

  await fs.writeFile(
    path.join(publicIconsDir, 'manifest.json'),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), forceRefresh, icons: manifest, failures }, null, 2)}\n`,
  )

  console.log(`\nIcons ready: ${Object.keys(manifest).length}/${projects.length}`)
  if (failures.length > 0) {
    console.log('Failures:', failures)
    process.exitCode = 1
  }
}

main()
