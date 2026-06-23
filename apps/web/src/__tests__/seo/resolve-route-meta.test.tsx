import { describe, expect, it } from 'vitest'
import { getIndexablePaths, resolveRouteMeta } from '../../lib/seo/resolve-route-meta'

describe('resolveRouteMeta', () => {
  it('returns home metadata with structured data', () => {
    const meta = resolveRouteMeta('/')
    expect(meta.title).toContain('Crypto Watcher')
    expect(meta.path).toBe('/')
    expect(meta.noIndex).toBeUndefined()
    expect(meta.jsonLd).toBeDefined()
  })

  it('returns blog post metadata', () => {
    const meta = resolveRouteMeta('/blog/launch-story')
    expect(meta.title).toContain("Moody's of crypto")
    expect(meta.ogType).toBe('article')
    expect(meta.publishedTime).toBeDefined()
    expect(meta.path).toBe('/blog/launch-story')
  })

  it('returns reference project metadata with score in title', () => {
    const meta = resolveRouteMeta('/app/reference/bitcoin')
    expect(meta.title).toContain('Bitcoin')
    expect(meta.title).toContain('96')
    expect(meta.image).toBe('/icons/bitcoin.png')
    expect(meta.path).toBe('/app/reference/bitcoin')
  })

  it('noindexes auth routes', () => {
    expect(resolveRouteMeta('/auth/signin').noIndex).toBe(true)
    expect(resolveRouteMeta('/auth/signup').noIndex).toBe(true)
  })

  it('noindexes unknown routes', () => {
    const meta = resolveRouteMeta('/does-not-exist')
    expect(meta.noIndex).toBe(true)
    expect(meta.title).toContain('Not Found')
  })
})

describe('getIndexablePaths', () => {
  it('includes core public routes and dynamic content', () => {
    const paths = getIndexablePaths()
    expect(paths).toContain('/')
    expect(paths).toContain('/blog')
    expect(paths).toContain('/blog/launch-story')
    expect(paths).toContain('/app/reference/bitcoin')
    expect(paths).not.toContain('/auth/signin')
  })
})
