import { useEffect, useSyncExternalStore } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { resolveCoingeckoId } from '../lib/coingecko-ids'
import { readLocalMarketCache, writeLocalMarketCache } from '../lib/market-local-cache'
import { normalizeMarketSnapshot } from '../lib/normalize-market-snapshot'
import type { MarketSnapshot } from '../lib/market.types'
import type { MarketCacheWorkerResponse } from '../workers/market-cache.worker'

export type MarketWarmupProgress = {
  phase: 'idle' | 'loading' | 'done'
  total: number
  saved: string[]
  remaining: string[]
}

const idleProgress: MarketWarmupProgress = {
  phase: 'idle',
  total: 0,
  saved: [],
  remaining: [],
}

let warmupStarted = false
let progress = idleProgress
const listeners = new Set<() => void>()

function publish(next: MarketWarmupProgress) {
  progress = next
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function resetMarketCacheWarmup(): void {
  warmupStarted = false
  publish(idleProgress)
}

function marketApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return window.location.origin
}

function announceMarketsReady(): void {
  if (!import.meta.env.DEV) return
  toast.success('All market prices are saved locally')
}

function rememberSaved(snapshot: MarketSnapshot) {
  publish({
    ...progress,
    saved: progress.saved.includes(snapshot.slug)
      ? progress.saved
      : [...progress.saved, snapshot.slug],
    remaining: progress.remaining.filter((slug) => slug !== snapshot.slug),
  })
}

export function useMarketCacheWorker(slugs: readonly string[]) {
  const queryClient = useQueryClient()
  const status = useSyncExternalStore(subscribe, () => progress)

  useEffect(() => {
    if (warmupStarted) return
    warmupStarted = true

    const tradable = slugs.filter((slug) => resolveCoingeckoId(slug))
    const saved = tradable.filter((slug) => {
      const cached = readLocalMarketCache(slug)
      return Boolean(cached && !cached.stale)
    })
    const pending = tradable.filter((slug) => !saved.includes(slug))

    const ready = () => tradable.every((slug) => readLocalMarketCache(slug))

    if (pending.length === 0) return

    publish({
      phase: 'loading',
      total: tradable.length,
      saved: [...saved],
      remaining: [...pending],
    })

    const worker = new Worker(new URL('../workers/market-cache.worker.ts', import.meta.url), {
      type: 'module',
    })

    const onMessage = (event: MessageEvent<MarketCacheWorkerResponse>) => {
      if (event.data.type === 'snapshot') {
        const snapshot = normalizeMarketSnapshot(event.data.snapshot)
        if (!snapshot) return
        writeLocalMarketCache(snapshot.slug, snapshot)
        queryClient.setQueryData(['market', snapshot.slug], snapshot)
        rememberSaved(snapshot)
        return
      }

      if (event.data.type !== 'complete') return

      publish({ ...progress, phase: 'done' })
      if (ready()) {
        announceMarketsReady()
        worker.removeEventListener('message', onMessage)
      }
      worker.terminate()
    }

    worker.addEventListener('message', onMessage)
    worker.postMessage({ slugs: pending, apiBase: marketApiBase() })
  }, [queryClient, slugs])

  return status
}
