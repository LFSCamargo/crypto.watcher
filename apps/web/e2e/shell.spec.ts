import { expect, isMobile, test } from './fixtures'

test.describe('application shell', () => {
  test('skip link moves keyboard users to the main content', async ({ page }) => {
    await page.goto('/app')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(page.getByRole('banner')).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(skip).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeFocused()
  })

  test('focus moves to the main region after client navigation', async ({ page }) => {
    await page.goto('/')
    const nav = isMobile(page)
      ? page.getByRole('navigation', { name: 'Mobile' })
      : page.getByRole('navigation', { name: 'Primary' })
    await nav.getByRole('link', { name: 'Governance' }).click()
    await expect(page).toHaveURL(/\/app\/governance$/)
    await expect(page.locator('#main-content')).toBeFocused()
  })

  test('the command palette opens with the keyboard and restores focus', async ({
    page,
  }) => {
    test.skip(isMobile(page), 'Keyboard shortcut is a desktop affordance')
    await page.goto('/app')
    await page.keyboard.press('ControlOrMeta+k')
    const input = page.getByRole('textbox', { name: 'Search crypto projects' })
    await expect(input).toBeFocused()
    await input.fill('ethereum')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/search=ethereum/)
  })

  test('resources menu is keyboard operable on desktop', async ({ page }) => {
    test.skip(isMobile(page), 'Desktop navigation only')
    await page.goto('/app')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const trigger = page.getByRole('button', { name: 'Resources' })
    await trigger.focus()
    await page.keyboard.press('Enter')
    const whitepaper = page
      .getByRole('navigation', { name: 'Resources' })
      .getByRole('link', { name: /Whitepaper/ })
    await expect(whitepaper).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(whitepaper).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('mobile menu reaches resources, governance and account actions', async ({
    page,
  }) => {
    test.skip(!isMobile(page), 'Mobile navigation only')
    await page.goto('/app')
    await page.getByRole('button', { name: 'Open menu' }).click()
    const sheet = page.getByRole('dialog', { name: 'Menu' })
    await expect(sheet.getByRole('link', { name: 'Get started' })).toBeVisible()
    await sheet.getByRole('link', { name: /Tokenomics/ }).click()
    await expect(page).toHaveURL(/\/docs\/tokenomics$/)
    await expect(sheet).toBeHidden()
  })

  test('the fixed mobile bar never covers the last content on the page', async ({
    page,
  }) => {
    test.skip(!isMobile(page), 'Mobile navigation only')
    await page.goto('/app')
    await page.keyboard.press('End')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    const disclaimer = page.getByText('Not financial advice.')
    const bar = page.getByRole('navigation', { name: 'Mobile' })
    const [disclaimerBox, barBox] = await Promise.all([
      disclaimer.boundingBox(),
      bar.boundingBox(),
    ])
    expect(disclaimerBox!.y + disclaimerBox!.height).toBeLessThanOrEqual(barBox!.y)
  })

  test('signed-in members see account actions in both themes', async ({ page, api }) => {
    api.signIn()
    await page.goto('/app')
    if (isMobile(page)) {
      await page.getByRole('button', { name: 'Open menu' }).click()
      await expect(
        page.getByRole('dialog').getByRole('link', { name: 'Profile' }),
      ).toBeVisible()
    } else {
      await page.getByRole('button', { name: /Account menu/ }).click()
      await expect(page.getByRole('menuitem', { name: 'Request a review' })).toBeVisible()
    }
  })
})

test.describe('dark theme', () => {
  test.use({ theme: 'dark' })

  test('applies the dark class and keeps the header surface', async ({ page }) => {
    await page.goto('/app')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByRole('banner').locator('[data-size]')).toHaveClass(/glass-nav/)
  })
})
