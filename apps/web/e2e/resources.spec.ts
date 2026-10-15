import { expect, test } from './fixtures'

test.describe('Docs and blog', () => {
  test('keeps docs metadata and uses a single main landmark', async ({ page }) => {
    await page.goto('/docs/governance')

    await expect(page).toHaveTitle(/Governance Guide/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/docs\/governance$/,
    )
    await expect(page.locator('main')).toHaveCount(1)
    const isDesktop = (page.viewportSize()?.width ?? 0) >= 1024
    if (isDesktop) {
      await expect(
        page
          .getByRole('navigation', { name: 'Documentation' })
          .getByRole('link', { name: 'Governance' }),
      ).toHaveAttribute('aria-current', 'page')
    } else {
      await expect(page.getByRole('button', { name: 'Documentation menu' })).toHaveText(
        'Governance',
      )
    }
  })

  test('deep links to a section anchor', async ({ page }) => {
    await page.goto('/docs/faq#reviews-scores')

    const heading = page.getByRole('heading', { level: 2, name: 'Reviews & Scores' })
    await expect(heading).toBeInViewport()
  })

  test('moves between docs pages in order', async ({ page }) => {
    await page.goto('/docs/whitepaper')

    const pager = page.getByRole('navigation', { name: 'Documentation pages' })
    await pager.getByRole('link', { name: /Next.*Tokenomics/ }).click()
    await expect(page).toHaveURL(/\/docs\/tokenomics$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('keeps blog post metadata and suggests other articles', async ({ page }) => {
    await page.goto('/blog/launch-story')

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/blog\/launch-story$/,
    )
    const related = page.getByRole('region', { name: 'More from the blog' })
    await related.getByRole('link').first().click()
    await expect(page).toHaveURL(/\/blog\/(?!launch-story)[a-z-]+$/)
  })
})

test.describe('Docs on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('opens the docs menu sheet and navigates', async ({ page }) => {
    await page.goto('/docs')

    await page.getByRole('button', { name: 'Documentation menu' }).click()
    const sheet = page.getByRole('dialog', { name: 'Documentation' })
    await sheet.getByRole('link', { name: 'FAQ' }).click()

    await expect(page).toHaveURL(/\/docs\/faq$/)
    await expect(sheet).toBeHidden()
  })

  test('scrolls wide tables inside their own region', async ({ page }) => {
    await page.goto('/docs/tokenomics')

    const region = page.getByRole('region', { name: 'Token Distribution table' })
    await expect(region).toBeVisible()
    const overflow = await region.evaluate((node) => node.scrollWidth > node.clientWidth)
    expect(overflow).toBe(true)
    const pageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(pageOverflow).toBe(false)
  })
})
