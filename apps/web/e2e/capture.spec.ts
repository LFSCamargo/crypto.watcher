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

const routes: {
  name: string
  path: string
  signedIn?: boolean
  role?: 'user' | 'team' | 'admin'
}[] = [
  { name: 'landing', path: '/' },
  { name: 'catalog', path: '/app' },
  { name: 'reference', path: '/app/reference/bitcoin' },
  { name: 'project', path: '/app/projects/aave' },
  { name: 'signin', path: '/auth/signin' },
  { name: 'signup', path: '/auth/signup' },
  { name: 'onboarding', path: '/auth/onboarding', signedIn: true },
  { name: 'request', path: '/app/analysis-request', signedIn: true },
  { name: 'queue', path: '/app?view=in-analysis' },
  { name: 'docs', path: '/docs' },
  { name: 'blog', path: '/blog' },
  { name: 'governance', path: '/app/governance' },
  { name: 'proposal', path: '/app/governance/1' },
  { name: 'reviewer', path: '/app/u/0x00000000000000000000000000000000000000c1' },
  { name: 'profile', path: '/app/profile', signedIn: true },
  { name: 'admin', path: '/app/admin', signedIn: true, role: 'team' },
]

test.describe('redesign capture', () => {
  test.skip(!stage, 'Set CAPTURE_STAGE to record screenshots')

  for (const theme of ['light', 'dark'] as const) {
    test.describe(theme, () => {
      test.use({ theme })

      for (const route of routes) {
        test(route.name, async ({ page, api }, testInfo) => {
          if (route.signedIn) api.signIn({ role: route.role ?? 'user' })
          await page.goto(route.path)
          await expect(page.locator('main')).not.toBeEmpty()
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
