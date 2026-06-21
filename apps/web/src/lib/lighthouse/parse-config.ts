import type { LighthouseCategory, LighthouseThresholds } from './evaluate-audit'

export type LighthouseConfig = {
  host: string
  port: number
  paths: string[]
  thresholds: LighthouseThresholds
  outputDir: string
}

const DEFAULT_CATEGORIES: LighthouseCategory[] = [
  'performance',
  'accessibility',
  'best-practices',
  'seo',
]

export function parseLighthouseConfig(raw: unknown): LighthouseConfig {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Lighthouse config must be a JSON object')
  }

  const config = raw as Record<string, unknown>
  const host = typeof config.host === 'string' ? config.host : '127.0.0.1'
  const port = typeof config.port === 'number' ? config.port : 4173
  const paths = Array.isArray(config.paths)
    ? config.paths.filter((path): path is string => typeof path === 'string' && path.length > 0)
    : ['/']
  const outputDir =
    typeof config.outputDir === 'string' ? config.outputDir : 'lighthouse-reports'

  const thresholdsRaw =
    config.thresholds && typeof config.thresholds === 'object'
      ? (config.thresholds as Record<string, unknown>)
      : {}

  const thresholds: LighthouseThresholds = {}
  for (const category of DEFAULT_CATEGORIES) {
    const value = thresholdsRaw[category]
    if (typeof value === 'number') {
      thresholds[category] = value
    }
  }

  if (Object.keys(thresholds).length === 0) {
    throw new Error('Lighthouse config must define at least one category threshold')
  }

  if (paths.length === 0) {
    throw new Error('Lighthouse config must include at least one path')
  }

  return { host, port, paths, thresholds, outputDir }
}

export function buildAuditUrl(host: string, port: number, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `http://${host}:${port}${normalizedPath}`
}
