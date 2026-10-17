import { screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../../../lib/api/client'
import { renderWithProviders } from '../../../test/render'
import { useProtocolMetrics } from '../hooks/use-protocol-metrics'
import {
  readProtocolMetricsCache,
  writeProtocolMetricsCache,
} from '../lib/protocol-metrics-local-cache'
import {
  PROTOCOL_METRICS_RETENTION_MS,
  PROTOCOL_METRICS_STALE_TIME_MS,
  type ProtocolMetricsSnapshot,
} from '../lib/protocol-metrics.types'

vi.mock('../../../lib/api/client', () => ({
  apiFetch: vi.fn(),
}))

function MetricsProbe({ slug }: { slug: string }) {
  const { data, isError } = useProtocolMetrics(slug)
  return (
    <div>
      <p>{isError ? 'error' : 'ok'}</p>
      <p>{data ? `tvl:${data.tvl}` : 'empty'}</p>
      <p>{data && data.revenueHistory.length >= 2 ? 'revenue-chart' : 'no-revenue-chart'}</p>
      {data?.stale ? <p>stale</p> : null}
    </div>
  )
}

function snapshot(slug: string, tvl: number): ProtocolMetricsSnapshot {
  const now = Date.now()
  return {
    slug,
    entityType: 'protocol',
    defillamaId: `protocol:${slug}`,
    name: slug,
    category: 'Lending',
    website: null,
    chains: ['Ethereum'],
    mcap: 1,
    tvl,
    tvlChange24h: 1,
    tvlChange7d: 2,
    tvlChange30d: 3,
    tvlHistory: [
      { timestamp: now - 86_400_000, tvl: tvl - 1 },
      { timestamp: now, tvl },
    ],
    chainBreakdown: [],
    tokenComposition: [],
    fees24h: 10,
    fees7d: 20,
    fees30d: 30,
    feesChange1d: 1,
    feesHistory: [
      { timestamp: now - 86_400_000, value: 9 },
      { timestamp: now, value: 10 },
    ],
    revenue24h: 4,
    revenue7d: 8,
    revenue30d: 12,
    revenueHistory: [
      { timestamp: now - 86_400_000, value: 3 },
      { timestamp: now, value: 4 },
    ],
    dexVolume24h: null,
    dexVolume7d: null,
    dexVolume30d: null,
    dexVolumeChange1d: null,
    dexVolumeHistory: [],
    exploits: [],
    exploitCount: 0,
    totalExploitLossUsd: null,
    valuation: null,
    snapshotVersion: 10,
    cachedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + PROTOCOL_METRICS_STALE_TIME_MS).toISOString(),
  }
}

describe('protocol metrics hydration', () => {
  afterEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('keeps TVL and revenue charts when a refresh fails inside the week', async () => {
    const saved = snapshot('aave', 12_600_000_000)
    saved.cachedAt = new Date(Date.now() - PROTOCOL_METRICS_STALE_TIME_MS - 1000).toISOString()
    saved.expiresAt = new Date(Date.now() - 1000).toISOString()
    writeProtocolMetricsCache('aave', saved)
    vi.mocked(apiFetch).mockRejectedValue(new Error('API 500: upstream'))

    renderWithProviders(<MetricsProbe slug="aave" />)

    expect(screen.getByText('tvl:12600000000')).toBeInTheDocument()
    expect(screen.getByText('revenue-chart')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('stale')).toBeInTheDocument())
    expect(screen.getByText('ok')).toBeInTheDocument()
  })

  it('shows an error once the saved snapshot is older than a week', async () => {
    const saved = snapshot('aave', 12_600_000_000)
    saved.cachedAt = new Date(Date.now() - PROTOCOL_METRICS_RETENTION_MS - 1000).toISOString()
    saved.expiresAt = saved.cachedAt
    writeProtocolMetricsCache('aave', saved)
    expect(readProtocolMetricsCache('aave')).toBeNull()
    vi.mocked(apiFetch).mockRejectedValue(new Error('API 500: upstream'))

    renderWithProviders(<MetricsProbe slug="aave" />)

    await waitFor(() => expect(screen.getByText('error')).toBeInTheDocument())
    expect(screen.getByText('empty')).toBeInTheDocument()
  })
})