#!/usr/bin/env node
/**
 * Local smoke test for protocol metrics + valuation (v6, 365d history, 1Y charts).
 *
 * Usage:
 *   node scripts/smoke-protocol-metrics.mjs
 *   API_URL=http://localhost:3000 node scripts/smoke-protocol-metrics.mjs
 */

const API_URL = (process.env.API_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const WEB_URL = (process.env.WEB_URL ?? 'http://localhost:5173').replace(/\/$/, '')

const SLUGS = ['aave', 'ethereum', 'usd-coin']

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function fetchSnapshot(slug) {
  const response = await fetch(`${API_URL}/protocol-metrics/projects/${slug}`)
  if (!response.ok) {
    throw new Error(`${slug}: HTTP ${response.status} ${response.statusText}`)
  }
  return response.json()
}

async function main() {
  console.log(`Smoke testing protocol metrics at ${API_URL}\n`)

  let healthOk = false
  try {
    const health = await fetch(`${API_URL}/health`)
    healthOk = health.ok
  } catch {
    healthOk = false
  }

  assert(
    healthOk,
    `API is not reachable at ${API_URL}. Start it with: pnpm run dev (or pnpm run docker:dev)`,
  )

  for (const slug of SLUGS) {
    const snapshot = await fetchSnapshot(slug)
    const valuation = snapshot.valuation

    console.log(`✓ ${slug}`)
    console.log(`  entity: ${snapshot.entityType}`)
    console.log(`  snapshot v${snapshot.snapshotVersion}`)
    console.log(`  tvl history: ${snapshot.tvlHistory?.length ?? 0} points`)
    console.log(`  fees history: ${snapshot.feesHistory?.length ?? 0} points`)

    assert(snapshot.snapshotVersion === 6, `${slug}: expected snapshotVersion 6`)
    assert(
      (snapshot.tvlHistory?.length ?? 0) >= 90,
      `${slug}: expected at least 90 days of TVL history for 1Y charts`,
    )

    if (snapshot.entityType === 'protocol' && valuation) {
      console.log(`  valuation composite: ${Math.round(valuation.compositeScore ?? 0)}/100`)
      console.log(`  revenue capture: ${valuation.revenueCaptureRate?.toFixed(1) ?? '—'}%`)
      assert(valuation.methodologyVersion === 'CW-Valuation-v1', `${slug}: missing valuation model`)
    } else if (snapshot.entityType === 'chain' && valuation) {
      console.log(`  valuation composite: ${Math.round(valuation.compositeScore ?? 0)}/100 (fees-only)`)
      assert(valuation.methodologyVersion === 'CW-Valuation-v1', `${slug}: missing valuation model`)
    } else if (snapshot.entityType === 'protocol' || snapshot.entityType === 'chain') {
      console.log('  valuation: (none — missing fee/revenue feed)')
    } else {
      console.log('  valuation: n/a for stablecoins')
    }

    console.log(`  UI: ${WEB_URL}/app/reference/${slug}`)
  }

  console.log('All protocol metrics smoke checks passed.')
  console.log('\nOpen in browser:')
  console.log(`  ${WEB_URL}/app/reference/aave`)
  console.log(`  ${WEB_URL}/app/projects/aave`)
  console.log('Scroll to "Protocol fundamentals" → check 1Y on charts and "On-chain valuation model".')
}

main().catch((error) => {
  console.error('\nSmoke test failed:', error.message)
  process.exit(1)
})
