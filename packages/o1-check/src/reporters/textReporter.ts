import type { ScanReport } from '../types.js'
import { formatRiskLabel, formatSeverity } from '../scoring.js'

export function renderTextReport(report: ScanReport): string {
  const lines: string[] = []

  lines.push('O1 Check Report')
  lines.push('')
  lines.push(`Score: ${report.score}/100`)
  lines.push(`Risk: ${formatRiskLabel(report.risk)}`)
  lines.push('')
  lines.push('Findings:')

  if (report.findings.length === 0) {
    lines.push('No performance or complexity risks detected.')
    return lines.join('\n')
  }

  report.findings.forEach((finding, index) => {
    lines.push(`${index + 1}. ${formatSeverity(finding.severity)} - ${finding.title}`)
    lines.push(`   File: ${finding.filePath}:${finding.line}`)
    lines.push(`   Complexity: ${finding.complexity}`)
    lines.push(`   Recommendation: ${finding.recommendation}`)
    lines.push('')
  })

  return lines.join('\n').trimEnd()
}
