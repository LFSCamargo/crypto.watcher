import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, loadConfig, scan } from '../scanner.js'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')

describe('scanner', () => {
  it('collects source files and ignores fixture-adjacent build dirs', async () => {
    const files = await collectSourceFiles([fixturesDir], {})
    expect(files.some((file) => file.endsWith('risky.ts'))).toBe(true)
    expect(files.some((file) => file.endsWith('safe.ts'))).toBe(true)
  })

  it('detects risky patterns in fixtures', async () => {
    const report = await scan([fixturesDir])

    expect(report.filesScanned).toBeGreaterThan(0)
    expect(report.findings.some((finding) => finding.id === 'db.query-in-loop')).toBe(true)
    expect(report.findings.some((finding) => finding.id === 'code.nested-loop')).toBe(true)
    expect(report.findings.some((finding) => finding.id === 'async.await-in-loop')).toBe(true)
  })

  it('loads config files', () => {
    const configPath = path.join(path.dirname(fixturesDir), '..', '..', 'o1-check.config.example.json')
    const config = loadConfig(configPath)
    expect(config.failBelow).toBe(70)
    expect(config.rules?.disabled).toContain('db.select-all')
  })
})
