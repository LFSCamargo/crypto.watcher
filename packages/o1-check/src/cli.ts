#!/usr/bin/env node
import { pathToFileURL } from 'node:url'
import { renderJsonReport } from './reporters/jsonReporter.js'
import { renderTextReport } from './reporters/textReporter.js'
import { hasCriticalFinding } from './scoring.js'
import { loadConfig, scan } from './scanner.js'
import type { CliOptions } from './types.js'

export function parseArgs(argv: string[]): CliOptions {
  const paths: string[] = []
  let format: CliOptions['format'] = 'text'
  let failBelow: number | undefined
  let configPath: string | undefined

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]!

    if (arg === '--format') {
      const value = argv[index + 1]
      if (value !== 'json' && value !== 'text') {
        throw new Error('--format must be "json" or "text"')
      }
      format = value
      index += 1
      continue
    }

    if (arg === '--fail-below') {
      const value = Number(argv[index + 1])
      if (!Number.isFinite(value)) {
        throw new Error('--fail-below requires a numeric score')
      }
      failBelow = value
      index += 1
      continue
    }

    if (arg === '--config') {
      configPath = argv[index + 1]
      if (!configPath) {
        throw new Error('--config requires a file path')
      }
      index += 1
      continue
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`)
    }

    paths.push(arg)
  }

  if (paths.length === 0) {
    paths.push('src')
  }

  return { paths, format, failBelow, configPath }
}

export async function runCli(argv: string[]): Promise<number> {
  const options = parseArgs(argv)
  const config = loadConfig(options.configPath)
  const failBelow = options.failBelow ?? config.failBelow

  const report = await scan(options.paths, config)
  const output = options.format === 'json' ? renderJsonReport(report) : renderTextReport(report)

  process.stdout.write(output)
  if (!output.endsWith('\n')) {
    process.stdout.write('\n')
  }

  if (hasCriticalFinding(report.findings)) {
    return 1
  }

  if (failBelow !== undefined && report.score < failBelow) {
    return 1
  }

  return 0
}

async function main(): Promise<void> {
  try {
    const exitCode = await runCli(process.argv.slice(2))
    process.exitCode = exitCode
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`o1-check: ${message}\n`)
    process.exitCode = 1
  }
}

const isDirectRun =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href

if (isDirectRun) {
  void main()
}
