export type Severity = 'low' | 'medium' | 'high' | 'critical'

export type Category = 'code' | 'database' | 'memory' | 'async' | 'api'

export type Complexity =
  | 'O(1)'
  | 'O(log n)'
  | 'O(n)'
  | 'O(n log n)'
  | 'O(n²)'
  | 'O(n) DB calls'
  | 'unknown'

export type RiskLevel = 'low' | 'acceptable' | 'medium' | 'high' | 'critical'

export interface Finding {
  id: string
  title: string
  severity: Severity
  category: Category
  complexity: Complexity
  recommendation: string
  filePath: string
  line: number
  column?: number
}

export interface ScanReport {
  score: number
  risk: RiskLevel
  findings: Finding[]
  filesScanned: number
}

export interface O1CheckConfig {
  ignore?: string[]
  /** Path fragments — files whose absolute path contains any fragment are skipped. */
  ignorePaths?: string[]
  failBelow?: number
  rules?: {
    enabled?: string[]
    disabled?: string[]
  }
}

export interface CliOptions {
  paths: string[]
  format: 'text' | 'json'
  failBelow?: number
  configPath?: string
}

export const DEFAULT_IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.next',
  'coverage',
  '__tests__',
])

export const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx'])
