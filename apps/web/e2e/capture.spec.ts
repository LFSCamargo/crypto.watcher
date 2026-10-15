import { fileURLToPath } from 'node:url'
import { expect, test } from './fixtures'

/**
 * Opt-in visual capture for the redesign record (docs/redesign/screenshots).
 * Run: CAPTURE_STAGE=r0 pnpm --filter web exec playwright test capture
 */
const stage = process.env.CAPTURE_STAGE
const outDir = fileURLToPath(
  new URL('../../../docs/redesign/screenshots/', import.meta.url),
)

const routes: { name: string; path: string; signedIn?: boolean }[] = [
  { name: 'landing', path: '/' },
  { name: 'catalog', path: '/app' },
  { name: 'reference', path: '/app/reference/bitcoin' },
  { name: 'project', path: '/app/projects/aave' },
  { name: 'signin', path: '/auth/signin' },
  { name: 'request', path: '/app/analysis-request', signedIn: true },
  { name: 'queue', path: '/app/in-analysis' },
  { name: 'docs', path: '/docs' },
  { name: 'blog', path: '/blog' },
  { name: 'governance', path: '/app/governance' },
  { name: 'profile', path: '/app/profile', signedIn: true },
]

test.describe('redesign capture', () => {
  test.skip(!stage, 'Set CAPTURE_STAGE to record screenshots')

  for (const theme of ['light', 'dark'] as const) {
    test.describe(theme, () => {
      test.use({ theme })

      for (const route of routes) {
        test(route.name, async ({ page, api }, testInfo) => {
          if (route.signedIn) api.signIn()
          await page.goto(route.path)
          await expect(page.locator('main').first()).not.toBeEmpty()
          await page.waitForLoadState('networkidle')
          await page.screenshot({
            path: `${outDir}${stage}-${route.name}-${testInfo.project.name}-${theme}.jpg`,
            type: 'jpeg',
            quality: 60,
          })
        })
      }
    })
  }
})
