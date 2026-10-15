#!/usr/bin/env node
/**
 * Summarize the production bundle in `dist/assets` (raw and gzip bytes per chunk).
 *
 * Run after `vite build`: pnpm --filter web exec tsx scripts/report-bundle-size.ts [--out file.json]
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const assetsDir = resolve(webRoot, 'dist/assets')
const outIndex = process.argv.indexOf('--out')
const outPath =
  outIndex > -1 ? resolve(process.cwd(), process.argv[outIndex + 1] ?? '') : undefined

const files = readdirSync(assetsDir).filter((file) => /\.(js|css)$/.test(file))
const chunks = files
  .map((file) => {
    const content = readFileSync(resolve(assetsDir, file))
    return {
      file: file.replace(/-[\w-]{8}\.(js|css)$/, '.$1'),
      bytes: statSync(resolve(assetsDir, file)).size,
      gzipBytes: gzipSync(content).length,
    }
  })
  .sort((a, b) => b.gzipBytes - a.gzipBytes)

const total = (ext: string) =>
  chunks
    .filter((chunk) => chunk.file.endsWith(ext))
    .reduce(
      (sum, chunk) => ({
        bytes: sum.bytes + chunk.bytes,
        gzipBytes: sum.gzipBytes + chunk.gzipBytes,
      }),
      {
        bytes: 0,
        gzipBytes: 0,
      },
    )

const indexHtml = readFileSync(resolve(webRoot, 'dist/index.html'), 'utf8')
const initialScripts = [
  ...indexHtml.matchAll(/(?:src|href)="\/assets\/([^"]+\.(?:js|css))"/g),
].map((match) => match[1]!)
const initialGzipBytes = initialScripts.reduce(
  (sum, file) => sum + gzipSync(readFileSync(resolve(assetsDir, file))).length,
  0,
)

const report = {
  js: total('.js'),
  css: total('.css'),
  initialGzipBytes,
  largest: chunks.slice(0, 12),
}
const json = JSON.stringify(report, null, 2)

if (outPath) writeFileSync(outPath, `${json}\n`)
console.log(json)
