#!/usr/bin/env node
/**
 * Spaghetti checker — enforces one-context-per-file module layout for API + web.
 * Run: node scripts/check-spaghetti.mjs [--changed <file>]
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const API_MODULES = join(ROOT, 'apps/api/src/modules')
const WEB_MODULES = join(ROOT, 'apps/web/src/modules')

const violations = []

const read = (filePath) => {
  try {
    return readFileSync(filePath, 'utf8')
  } catch {
    return ''
  }
}

const rel = (filePath) => relative(ROOT, filePath)

const add = (filePath, message) => {
  violations.push({ file: rel(filePath), message })
}

const listModuleDirs = (base) => {
  if (!existsSync(base)) return []
  return readdirSync(base)
    .map((name) => join(base, name))
    .filter((path) => statSync(path).isDirectory())
}

const isTestFile = (name) => name.endsWith('.test.ts') || name.endsWith('.test.tsx')

const checkApiModule = (moduleDir) => {
  const moduleName = moduleDir.split('/').pop()
  const entries = readdirSync(moduleDir)

  for (const entry of entries) {
    const full = join(moduleDir, entry)
    if (statSync(full).isDirectory()) continue

    if (entry.endsWith('.schema.ts')) {
      add(full, `Monolithic schema at module root — move to schemas/ and barrel-export from schemas/index.ts`)
    }

    if (isTestFile(entry) && entry !== 'index.ts') {
      add(full, `Test file must live in __tests__/ (e.g. ${moduleName}/__tests__/${entry})`)
    }

    if (entry.endsWith('.routes.ts')) {
      const source = read(full)
      if (/asyncHandler\s*\(\s*async/.test(source)) {
        add(full, 'Inline asyncHandler in routes — extract to handlers/<action>.handler.ts')
      }
      if (!source.includes("from './handlers") && !source.includes('from "./handlers')) {
        add(full, 'Routes must import handlers from ./handlers (thin wiring only)')
      }
    }

    if (entry.endsWith('.handlers.ts')) {
      add(full, 'Monolithic handlers file — split into handlers/ (one handler per file)')
    }
  }

  const schemasDir = join(moduleDir, 'schemas')
  if (existsSync(schemasDir)) {
    for (const schemaFile of readdirSync(schemasDir)) {
      if (!schemaFile.endsWith('.schema.ts')) continue
      const source = read(join(schemasDir, schemaFile))
      if (/extendZodWithOpenApi/.test(source)) {
        add(join(schemasDir, schemaFile), 'Use core/openapi/zod — do not call extendZodWithOpenApi in schema files')
      }
    }
  }

  if (entries.some((e) => e.endsWith('.routes.ts')) && !existsSync(join(moduleDir, 'handlers'))) {
    add(moduleDir, 'API module with routes must have a handlers/ folder')
  }
}

const checkWebModule = (moduleDir) => {
  const moduleName = moduleDir.split('/').pop()

  const testsDir = join(moduleDir, '__tests__')
  if (existsSync(testsDir)) {
    for (const testFile of readdirSync(testsDir)) {
      if (testFile.endsWith('.test.ts')) {
        add(
          join(testsDir, testFile),
          'Web tests must use Testing Library — rename to *.test.tsx and render components',
        )
      }
    }
  }

  for (const entry of readdirSync(moduleDir)) {
    const full = join(moduleDir, entry)
    if (statSync(full).isDirectory()) continue

    if (isTestFile(entry)) {
      add(full, `Test file must live in __tests__/ (e.g. ${moduleName}/__tests__/${entry})`)
    }

    if (entry === 'routes.tsx') {
      const source = read(full)
      if (/export\s+function\s+\w+/.test(source)) {
        add(full, 'Page components belong in pages/ — routes.tsx should re-export only')
      }
    }
  }

  const componentsDir = join(moduleDir, 'components')
  if (existsSync(componentsDir)) {
    for (const componentFile of readdirSync(componentsDir)) {
      if (!componentFile.endsWith('.tsx')) continue
      const full = join(componentsDir, componentFile)
      const source = read(full)
      const fnExports = (source.match(/^export\s+function\s+\w+/gm) ?? []).length
      const constExports = (source.match(/^export\s+const\s+\w+\s*=/gm) ?? []).length
      if (fnExports + constExports > 1) {
        add(full, 'One React component (or hook) per file — split into separate component files')
      }
    }
  }
}

const checkFile = (filePath) => {
  const normalized = filePath.startsWith('/') ? filePath : join(ROOT, filePath)

  if (normalized.includes('/apps/api/src/modules/')) {
    const moduleDir = normalized.split('/modules/')[1]?.split('/')[0]
    if (moduleDir) checkApiModule(join(API_MODULES, moduleDir))
    return
  }

  if (normalized.includes('/apps/web/src/modules/')) {
    const moduleDir = normalized.split('/modules/')[1]?.split('/')[0]
    if (moduleDir) checkWebModule(join(WEB_MODULES, moduleDir))
  }
}

const runAll = () => {
  for (const moduleDir of listModuleDirs(API_MODULES)) checkApiModule(moduleDir)
  for (const moduleDir of listModuleDirs(WEB_MODULES)) checkWebModule(moduleDir)
}

const changedArg = process.argv.indexOf('--changed')
if (changedArg !== -1 && process.argv[changedArg + 1]) {
  checkFile(process.argv[changedArg + 1])
} else {
  runAll()
}

if (violations.length > 0) {
  console.error('\nSpaghetti checker failed:\n')
  for (const { file, message } of violations) {
    console.error(`  ${file}\n    → ${message}\n`)
  }
  console.error(`${violations.length} violation(s). See .cursor/rules/spaghetti-checker.mdc\n`)
  process.exit(1)
}

console.log('Spaghetti checker passed.')
