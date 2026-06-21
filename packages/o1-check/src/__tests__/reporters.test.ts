import { describe, expect, it } from 'vitest'
import { renderJsonReport } from '../reporters/jsonReporter.js'
import { renderTextReport } from '../reporters/textReporter.js'
import { buildReport } from '../scoring.js'
import type { Finding } from '../types.js'

const sampleFinding: Finding = {
  id: 'db.query-in-loop',
  title: 'DB query inside loop',
  severity: 'high',
  category: 'database',
  complexity: 'O(n) DB calls',
  recommendation: 'Batch query using WHERE IN or use a join.',
  filePath: 'src/services/projects.ts',
  line: 42,
}

describe('reporters', () => {
  it('renders a human-readable report', () => {
    const report = buildReport([sampleFinding], 3)
    const text = renderTextReport(report)

    expect(text).toContain('O1 Check Report')
    expect(text).toContain('Score:')
    expect(text).toContain('DB query inside loop')
    expect(text).toContain('src/services/projects.ts:42')
  })

  it('renders JSON output', () => {
    const report = buildReport([sampleFinding], 3)
    const json = renderJsonReport(report)
    const parsed = JSON.parse(json) as { score: number; findings: Finding[] }

    expect(parsed.score).toBeTypeOf('number')
    expect(parsed.findings[0]?.title).toBe('DB query inside loop')
  })
})
