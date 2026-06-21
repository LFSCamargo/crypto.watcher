import { describe, expect, it } from 'vitest'
import { buildReport, hasCriticalFinding, riskFromScore, scoreFindings } from '../scoring.js'
import type { Finding } from '../types.js'

function finding(severity: Finding['severity']): Finding {
  return {
    id: 'test.rule',
    title: 'Test finding',
    severity,
    category: 'code',
    complexity: 'O(n)',
    recommendation: 'Fix it',
    filePath: 'src/example.ts',
    line: 1,
  }
}

describe('scoring', () => {
  it('starts at 100 with no findings', () => {
    expect(scoreFindings([])).toBe(100)
    expect(riskFromScore(100)).toBe('low')
  })

  it('deducts points by severity', () => {
    expect(scoreFindings([finding('low')])).toBe(97)
    expect(scoreFindings([finding('medium')])).toBe(92)
    expect(scoreFindings([finding('high')])).toBe(85)
    expect(scoreFindings([finding('critical')])).toBe(75)
  })

  it('maps score ranges to risk labels', () => {
    expect(riskFromScore(95)).toBe('low')
    expect(riskFromScore(80)).toBe('acceptable')
    expect(riskFromScore(60)).toBe('medium')
    expect(riskFromScore(40)).toBe('high')
    expect(riskFromScore(10)).toBe('critical')
  })

  it('sorts findings by severity', () => {
    const report = buildReport([finding('low'), finding('critical'), finding('medium')], 1)
    expect(report.findings.map((item) => item.severity)).toEqual(['critical', 'medium', 'low'])
  })

  it('detects critical findings', () => {
    expect(hasCriticalFinding([finding('high')])).toBe(false)
    expect(hasCriticalFinding([finding('critical')])).toBe(true)
  })
})
