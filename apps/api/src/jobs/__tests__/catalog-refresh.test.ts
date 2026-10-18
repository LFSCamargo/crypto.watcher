import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { CATALOG_SLUGS } from '../catalog-slugs'
import {
  CATALOG_REFRESH_INTERVAL_MS,
  refreshCatalogPaced,
  refreshOne,
  startCatalogRefresh,
} from '../catalog-refresh'
import { MARKET_CACHE_TTL_MS } from '../../modules/market/market.cache'

describe('CATALOG_SLUGS', () => {
  it('matches the web curated project list', () => {
    const source = readFileSync(
      resolve(
        __dirname,
        '../../../../../apps/web/src/modules/projects/lib/curated-projects.ts',
      ),
      'utf8',
    )
    const slugs = [...source.matchAll(/slug: '([^']+)'/g)].map((match) => match[1])
    expect([...CATALOG_SLUGS]).toEqual(slugs)
  })
})

describe('catalog refresh', () => {
  it('uses the 12 hour market cache interval', () => {
    expect(CATALOG_REFRESH_INTERVAL_MS).toBe(MARKET_CACHE_TTL_MS)
    expect(CATALOG_REFRESH_INTERVAL_MS).toBe(12 * 60 * 60 * 1000)
  })

  it('skips a fresh slug and marks a stale upstream response as failed', async () => {
    await expect(
      refreshOne(
        'bitcoin',
        async () => true,
        async () => ({ stale: false }),
      ),
    ).resolves.toBe('fresh')

    await expect(
      refreshOne(
        'bitcoin',
        async () => false,
        async () => ({ stale: true }),
      ),
    ).resolves.toBe('failed')

    await expect(
      refreshOne(
        'bitcoin',
        async () => false,
        async () => ({ stale: false }),
      ),
    ).resolves.toBe('updated')
  })

  it('waits only after an upstream update', async () => {
    const waited: number[] = []
    const totals = await refreshCatalogPaced(
      ['bitcoin', 'ethereum', 'solana'],
      async (slug) => (slug === 'ethereum' ? 'updated' : 'fresh'),
      1_500,
      async (ms) => {
        waited.push(ms)
      },
    )

    expect(totals).toEqual({ fresh: 2, updated: 1, failed: 0 })
    expect(waited).toEqual([1_500])
  })

  it('counts a thrown fetch as failed and continues', async () => {
    const totals = await refreshCatalogPaced(
      ['bitcoin', 'ethereum'],
      async (slug) => {
        if (slug === 'bitcoin') throw new Error('rate limit')
        return 'updated'
      },
      0,
    )

    expect(totals).toEqual({ fresh: 0, updated: 1, failed: 1 })
  })

  it('does not start a second refresh while one is running', async () => {
    let started = 0
    let release: () => void = () => undefined
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const stop = startCatalogRefresh(
      () => {
        started += 1
        return gate
      },
      12 * 60 * 60 * 1000,
    )

    await vi.waitFor(() => expect(started).toBe(1))
    stop()
    release()
  })
})
