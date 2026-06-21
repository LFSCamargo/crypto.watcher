#!/usr/bin/env node
/**
 * Build the web app, serve the production bundle with `vite preview`, and run
 * Lighthouse audits against configured public routes.
 *
 * Run: pnpm --filter web lighthouse
 * Skip rebuild: pnpm --filter web lighthouse -- --skip-build
 */
import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { launch as launchChrome } from 'chrome-launcher'
import lighthouse, { type Result } from 'lighthouse'
import {
  evaluateLighthouseAudit,
  type LighthouseCategory,
} from '../src/lib/lighthouse/evaluate-audit'
import { buildAuditUrl, parseLighthouseConfig } from '../src/lib/lighthouse/parse-config'

const __dirname = dirname(fileURLToPath(import.meta.url))
const webRoot = resolve(__dirname, '..')
const skipBuild = process.argv.includes('--skip-build')

const configPath = process.argv.includes('--config')
  ? resolve(process.argv[process.argv.indexOf('--config') + 1] ?? '')
  : resolve(webRoot, 'lighthouse.config.json')

const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
if (!process.env.CHROME_PATH && existsSync(macChrome)) {
  process.env.CHROME_PATH = macChrome
}

let configRaw: string
try {
  configRaw = readFileSync(configPath, 'utf8')
} catch (error) {
  if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
    throw new Error(
      `Lighthouse config not found at ${configPath}. Add apps/web/lighthouse.config.json or pass --config <path>.`,
    )
  }
  throw error
}

const config = parseLighthouseConfig(JSON.parse(configRaw))
const reportDir = resolve(webRoot, config.outputDir)

const run = (command: string, args: string[], cwd: string) =>
  new Promise<void>((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise()
        return
      }
      reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}`))
    })
  })

const waitForServer = async (url: string, timeoutMs = 60_000) => {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok || response.status === 404) {
        return
      }
    } catch {
      // retry until preview is ready
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 500))
  }
  throw new Error(`Timed out waiting for preview server at ${url}`)
}

const startPreview = (): ChildProcess => {
  const child = spawn(
    'pnpm',
    ['exec', 'vite', 'preview', '--host', config.host, '--port', String(config.port), '--strictPort'],
    {
      cwd: webRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    },
  )
  return child
}

const extractScores = (report: Result) => {
  const scores: Partial<Record<LighthouseCategory, number | null>> = {}
  for (const [key, category] of Object.entries(report.categories ?? {})) {
    if (!category || typeof category !== 'object') continue
    scores[key as LighthouseCategory] = category.score ?? null
  }
  return scores
}

const slugify = (path: string) => path.replace(/^\//, '').replace(/\//g, '-') || 'home'

async function main() {
  if (!skipBuild) {
    console.log('Building web app for Lighthouse…')
    await run('pnpm', ['exec', 'vite', 'build'], webRoot)
  }

  mkdirSync(reportDir, { recursive: true })

  const preview = startPreview()
  const baseUrl = `http://${config.host}:${config.port}/`

  try {
    await waitForServer(baseUrl)

    const chrome = await launchChrome({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
    }).catch(() => {
      throw new Error(
        'Chrome/Chromium not found. Install Google Chrome locally or run in CI with browser-actions/setup-chrome.',
      )
    })

    const evaluations = []

    try {
      for (const path of config.paths) {
        const url = buildAuditUrl(config.host, config.port, path)
        console.log(`\nAuditing ${url}`)

        const runner = await lighthouse(url, {
          logLevel: 'error',
          output: 'json',
          port: chrome.port,
          onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        })

        if (!runner?.lhr) {
          throw new Error(`Lighthouse returned no report for ${url}`)
        }

        const slug = slugify(path)
        writeFileSync(resolve(reportDir, `${slug}.json`), runner.report)

        const evaluation = evaluateLighthouseAudit(url, extractScores(runner.lhr), config.thresholds)
        evaluations.push(evaluation)

        for (const category of evaluation.categories) {
          const status = category.passed ? 'PASS' : 'FAIL'
          console.log(
            `  ${status} ${category.category}: ${category.score} (min ${category.minimum})`,
          )
        }
      }
    } finally {
      await chrome.kill()
    }

    const failed = evaluations.filter((evaluation) => !evaluation.passed)
    if (failed.length > 0) {
      console.error(`\nLighthouse failed for ${failed.length} route(s).`)
      process.exitCode = 1
      return
    }

    console.log(`\nLighthouse passed for ${evaluations.length} route(s).`)
  } finally {
    preview.kill('SIGTERM')
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
