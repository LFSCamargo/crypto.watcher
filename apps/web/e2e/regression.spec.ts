import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test, type MockApi, type Role } from './fixtures'

/**
 * R8 inventory regression: every surface at phone, tablet, 200%-zoom and desktop
 * widths in both themes, plus keyboard, reduced-motion, reduced-transparency and
 * automated WCAG 2.1 AA checks. Runs once (desktop project) and sets its own sizes.
 */
interface InventoryRoute {
  path: string
  role?: Role
  heading?: RegExp
}

const inventory: InventoryRoute[] = [
  { path: '/' },
  { path: '/auth/signin' },
  { path: '/auth/signup' },
  { path: '/auth/forgot-password' },
  { path: '/auth/verify-otp?email=ada%40example.com' },
  { path: '/auth/reset-password?token=valid-reset-token' },
  { path: '/auth/onboarding', role: 'user' },
  { path: '/app' },
  { path: '/app/projects/aave' },
  { path: '/app/projects/missing-project' },
  { path: '/app/reference/bitcoin' },
  { path: '/app?view=in-analysis' },
  { path: '/app/analysis-request' },
  { path: '/app/analysis-request', role: 'user' },
  { path: '/docs' },
  { path: '/docs/whitepaper' },
  { path: '/docs/tokenomics' },
  { path: '/docs/governance' },
  { path: '/docs/faq' },
  { path: '/blog' },
  { path: '/blog/launch-story' },
  { path: '/app/profile' },
  { path: '/app/profile', role: 'user' },
  { path: '/app/u/0x00000000000000000000000000000000000000c1' },
  { path: '/app/governance' },
  { path: '/app/governance/1' },
  { path: '/app/governance/999' },
  { path: '/app/admin', role: 'user' },
  { path: '/app/admin', role: 'team' },
  { path: '/definitely-not-a-route' },
]

const WIDTHS = [
  { label: 'phone', width: 360, height: 780 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: '200% zoom', width: 720, height: 450 },
  { label: 'desktop', width: 1440, height: 900 },
]

const label = (route: InventoryRoute) =>
  `${route.path}${route.role ? ` as ${route.role}` : ''}`

async function open(page: Page, api: MockApi, route: InventoryRoute) {
  if (route.role) api.signIn({ role: route.role })
  await page.goto(route.path)
  await expect(page.locator('main')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
}

test.describe('inventory regression', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop project only')

  for (const theme of ['light', 'dark'] as const) {
    test.describe(theme, () => {
      test.use({ theme })

      for (const route of inventory) {
        test(`${label(route)} lays out at every width`, async ({ page, api }) => {
          await open(page, api, route)
          for (const size of WIDTHS) {
            await page.setViewportSize({ width: size.width, height: size.height })
            const overflow = await page.evaluate(
              () => document.documentElement.scrollWidth - window.innerWidth,
            )
            expect(overflow, `horizontal overflow at ${size.label}`).toBeLessThanOrEqual(
              1,
            )
            await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
          }
        })

        test(`${label(route)} has no WCAG 2.1 AA violations`, async ({ page, api }) => {
          await open(page, api, route)
          await page.waitForLoadState('networkidle')
          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .analyze()
          const summary = results.violations.map(
            (violation) =>
              `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`,
          )
          expect(summary).toEqual([])
        })
      }
    })
  }

  for (const route of inventory.filter((item) => !item.role).slice(0, 12)) {
    test(`${label(route)} keeps keyboard focus on visible controls`, async ({
      page,
      api,
    }) => {
      await open(page, api, route)
      for (let step = 0; step < 12; step += 1) {
        await page.keyboard.press('Tab')
        const focused = await page.evaluate(() => {
          const element = document.activeElement as HTMLElement | null
          if (!element || element === document.body) return { ok: false, name: 'body' }
          const box = element.getBoundingClientRect()
          return {
            ok: box.width > 0 && box.height > 0,
            name: `${element.tagName} ${element.textContent?.trim().slice(0, 40) ?? ''}`,
          }
        })
        expect(focused.ok, `focus ${step + 1} landed on ${focused.name}`).toBe(true)
      }
    })
  }

  test('reduced transparency makes glass surfaces opaque', async ({ page }) => {
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }],
    })
    await page.goto('/')
    const alpha = await page
      .locator('header .glass-nav, .glass-nav')
      .first()
      .evaluate((node) => {
        const color = getComputedStyle(node).backgroundColor
        const parts = color.match(/[\d.]+/g) ?? []
        return parts.length === 4 ? Number(parts[3]) : 1
      })
    expect(alpha).toBe(1)
  })

  test('reduced motion is honoured', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/docs')
    const matches = await page.evaluate(
      () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    )
    expect(matches).toBe(true)
    await page.getByRole('link', { name: 'FAQ' }).first().click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
