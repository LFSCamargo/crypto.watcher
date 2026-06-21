import type { Finding, RiskLevel, ScanReport, Severity } from './types.js'

const SEVERITY_PENALTY: Record<Severity, number> = {
  low: 3,
  medium: 8,
  high: 15,
  critical: 25,
}

export function scoreFindings(findings: Finding[]): number {
  let score = 100

  for (const finding of findings) {
    score -= SEVERITY_PENALTY[finding.severity]
  }

  return Math.max(0, Math.min(100, score))
}

export function riskFromScore(score: number): RiskLevel {
  if (score >= 90) return 'low'
  if (score >= 70) return 'acceptable'
  if (score >= 50) return 'medium'
  if (score >= 30) return 'high'
  return 'critical'
}

export function buildReport(findings: Finding[], filesScanned: number): ScanReport {
  const score = scoreFindings(findings)
  const sortedFindings = [...findings].sort((a, b) => {
    const severityOrder: Record<Severity, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    }

    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
    if (severityDiff !== 0) {
      return severityDiff
    }

    if (a.filePath !== b.filePath) {
      return a.filePath.localeCompare(b.filePath)
    }

    return a.line - b.line
  })

  return {
    score,
    risk: riskFromScore(score),
    findings: sortedFindings,
    filesScanned,
  }
}

export function hasCriticalFinding(findings: Finding[]): boolean {
  return findings.some((finding) => finding.severity === 'critical')
}

export function formatRiskLabel(risk: RiskLevel): string {
  switch (risk) {
    case 'low':
      return 'Low'
    case 'acceptable':
      return 'Acceptable'
    case 'medium':
      return 'Medium'
    case 'high':
      return 'High'
    case 'critical':
      return 'Critical'
  }
}

export function formatSeverity(severity: Severity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1)
}
