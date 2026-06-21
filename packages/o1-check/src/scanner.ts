import { existsSync, readFileSync, statSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { Project } from 'ts-morph'
import { analyzeAsyncRisk } from './analyzers/asyncRisk.js'
import { analyzeCodeComplexity } from './analyzers/codeComplexity.js'
import { analyzeDatabaseRisk } from './analyzers/databaseRisk.js'
import { buildReport } from './scoring.js'
import type { Finding, O1CheckConfig, ScanReport } from './types.js'
import { DEFAULT_IGNORED_DIRS, SOURCE_EXTENSIONS } from './types.js'

export function loadConfig(configPath?: string): O1CheckConfig {
  if (!configPath) {
    return {}
  }

  if (!existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`)
  }

  const raw = readFileSync(configPath, 'utf8')
  return JSON.parse(raw) as O1CheckConfig
}

export function shouldIgnoreDir(name: string, config: O1CheckConfig): boolean {
  const ignored = new Set([...DEFAULT_IGNORED_DIRS, ...(config.ignore ?? [])])
  return ignored.has(name)
}

export async function collectSourceFiles(targetPaths: string[], config: O1CheckConfig): Promise<string[]> {
  const files = new Set<string>()

  for (const targetPath of targetPaths) {
    const absolutePath = path.resolve(targetPath)

    if (!existsSync(absolutePath)) {
      throw new Error(`Path not found: ${targetPath}`)
    }

    const stats = statSync(absolutePath)
    if (stats.isFile()) {
      if (isSourceFile(absolutePath) && !shouldIgnorePath(absolutePath, config)) {
        files.add(absolutePath)
      }
      continue
    }

    await walkDirectory(absolutePath, files, config)
  }

  return [...files].sort()
}

async function walkDirectory(directory: string, files: Set<string>, config: O1CheckConfig): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (shouldIgnoreDir(entry.name, config)) {
        continue
      }

      await walkDirectory(path.join(directory, entry.name), files, config)
      continue
    }

    const fullPath = path.join(directory, entry.name)
    if (isSourceFile(fullPath) && !shouldIgnorePath(fullPath, config)) {
      files.add(fullPath)
    }
  }
}

export function shouldIgnorePath(filePath: string, config: O1CheckConfig): boolean {
  for (const fragment of config.ignorePaths ?? []) {
    if (filePath.includes(fragment)) {
      return true
    }
  }

  return false
}

function isSourceFile(filePath: string): boolean {
  return SOURCE_EXTENSIONS.has(path.extname(filePath))
}

function isRuleEnabled(ruleId: string, config: O1CheckConfig): boolean {
  const disabled = new Set(config.rules?.disabled ?? [])
  if (disabled.has(ruleId)) {
    return false
  }

  const enabled = config.rules?.enabled
  if (!enabled || enabled.length === 0) {
    return true
  }

  return enabled.some((prefix) => ruleId.startsWith(prefix))
}

export async function scan(targetPaths: string[], config: O1CheckConfig = {}): Promise<ScanReport> {
  const files = await collectSourceFiles(targetPaths, config)

  if (files.length === 0) {
    return buildReport([], 0)
  }

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      allowJs: true,
      jsx: 2,
    },
  })

  for (const file of files) {
    project.addSourceFileAtPath(file)
  }

  const findings: Finding[] = []

  for (const sourceFile of project.getSourceFiles()) {
    const fileFindings = [
      ...analyzeCodeComplexity(sourceFile),
      ...analyzeDatabaseRisk(sourceFile),
      ...analyzeAsyncRisk(sourceFile),
    ].filter((finding) => isRuleEnabled(finding.id, config))

    findings.push(...fileFindings)
  }

  const deduped = dedupeFindings(findings)

  return buildReport(deduped, files.length)
}

function dedupeFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>()
  const result: Finding[] = []

  for (const finding of findings) {
    const key = `${finding.id}:${finding.filePath}:${finding.line}:${finding.title}`
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    result.push(finding)
  }

  return result
}
