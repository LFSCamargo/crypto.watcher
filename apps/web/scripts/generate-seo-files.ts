#!/usr/bin/env node
/**
 * Generate robots.txt and sitemap.xml into src/public before production builds.
 *
 * Run: pnpm --filter web seo:generate
 * Site URL: VITE_SITE_URL env (defaults to https://cryptowatcher.io).
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getIndexablePaths } from '../src/lib/seo/resolve-route-meta'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../src/public')

const siteUrl = (process.env.VITE_SITE_URL ?? 'https://cryptowatcher.io').replace(/\/+$/, '')
const paths = getIndexablePaths()
const today = new Date().toISOString().slice(0, 10)

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map((path) => {
    const priority =
      path === '/'
        ? '1.0'
        : path.startsWith('/app/reference/')
          ? '0.8'
          : path.startsWith('/blog/')
            ? '0.7'
            : path.startsWith('/docs')
              ? '0.6'
              : '0.5'
    const changefreq =
      path === '/' || path === '/app' ? 'daily' : path.startsWith('/blog/') ? 'monthly' : 'weekly'
    return `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  })
  .join('\n')}
</urlset>
`

const robots = `# Crypto Watcher — generated at build time
User-agent: *
Allow: /

Disallow: /auth/
Disallow: /app/admin
Disallow: /app/me
Disallow: /app/profile
Disallow: /app/u/

Sitemap: ${siteUrl}/sitemap.xml
`

writeFileSync(resolve(publicDir, 'sitemap.xml'), sitemap, 'utf8')
writeFileSync(resolve(publicDir, 'robots.txt'), robots, 'utf8')

console.log(`Generated SEO files for ${siteUrl} (${paths.length} URLs)`)
