import { describe, expect, it } from 'vitest'
import {
  CHAIN_PRIMARY_SLUGS,
  resolveMetricsTargets,
} from '../metrics-target'

describe('resolveMetricsTargets', () => {
  it('prefers chain TVL for layer-1 network slugs', () => {
    const targets = resolveMetricsTargets('ethereum')

    expect(targets[0]).toEqual({ type: 'chain', id: 'Ethereum' })
    expect(CHAIN_PRIMARY_SLUGS.has('ethereum')).toBe(true)
  })

  it('maps DeFi token slugs to protocol ids', () => {
    expect(resolveMetricsTargets('lido-dao')[0]).toEqual({
      type: 'protocol',
      id: 'lido',
    })
    expect(resolveMetricsTargets('usd-coin')[0]).toEqual({
      type: 'protocol',
      id: 'circle-usdc',
    })
  })

  it('falls back to chain TVL for infrastructure tokens when protocol slug differs', () => {
    const targets = resolveMetricsTargets('injective-protocol')

    expect(targets[0]).toEqual({ type: 'chain', id: 'Injective' })
    expect(targets).toContainEqual({ type: 'protocol', id: 'injective' })
  })

  it('returns no targets for unsupported slugs', () => {
    expect(resolveMetricsTargets('walletconnect')).toEqual([])
    expect(resolveMetricsTargets('render-token')).toEqual([])
  })

  it('tries protocol first for DeFi projects', () => {
    const targets = resolveMetricsTargets('aave')

    expect(targets[0]).toEqual({ type: 'protocol', id: 'aave' })
  })
})
