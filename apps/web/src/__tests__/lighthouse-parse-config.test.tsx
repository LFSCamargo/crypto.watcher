import { describe, expect, it } from 'vitest'
import { buildAuditUrl, parseLighthouseConfig } from '../lib/lighthouse/parse-config'

describe('parseLighthouseConfig', () => {
  it('parses a valid config with defaults', () => {
    const config = parseLighthouseConfig({
      paths: ['/', '/blog'],
      thresholds: {
        performance: 50,
        accessibility: 90,
        'best-practices': 90,
        seo: 85,
      },
    })

    expect(config.host).toBe('127.0.0.1')
    expect(config.port).toBe(4173)
    expect(config.paths).toEqual(['/', '/blog'])
    expect(config.outputDir).toBe('lighthouse-reports')
  })

  it('rejects configs without thresholds', () => {
    expect(() => parseLighthouseConfig({ paths: ['/'] })).toThrow(
      'Lighthouse config must define at least one category threshold',
    )
  })
})

describe('buildAuditUrl', () => {
  it('builds preview URLs for audit paths', () => {
    expect(buildAuditUrl('127.0.0.1', 4173, '/blog')).toBe('http://127.0.0.1:4173/blog')
    expect(buildAuditUrl('127.0.0.1', 4173, 'docs')).toBe('http://127.0.0.1:4173/docs')
  })
})
