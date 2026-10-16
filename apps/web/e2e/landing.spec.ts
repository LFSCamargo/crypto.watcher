import { expect, test } from './fixtures'

test.describe('landing page', () => {
  test('keeps canonical metadata for the home route', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Risk Review on the Blockchain/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/$/)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /Expert-governed crypto risk scores/,
    )
  })

  const ctas = [
    { region: /Is this crypto project safe/, link: 'Browse projects', url: /\/app$/ },
    {
      region: /Is this crypto project safe/,
      link: 'Get started',
      url: /\/auth\/signup$/,
    },
    {
      region: 'Governance, built in from day one',
      link: 'See governance status',
      url: /\/app\/governance$/,
    },
    { region: 'Learn how it works', link: /Whitepaper/, url: /\/docs\/whitepaper$/ },
    {
      region: 'Want a project reviewed by the council?',
      link: 'Request a review',
      url: /\/app\/analysis-request$/,
    },
  ]

  for (const cta of ctas) {
    test(`"${cta.link}" reaches its destination`, async ({ page }) => {
      await page.goto('/')
      await page
        .getByRole('region', { name: cta.region })
        .getByRole('link', { name: cta.link })
        .click()
      await expect(page).toHaveURL(cta.url)
    })
  }

  test('reference assessments open the reference page', async ({ page }) => {
    await page.goto('/')
    const section = page.getByRole('region', { name: 'Reference assessments' })
    await section.getByRole('link').first().click()
    await expect(page).toHaveURL(/\/app\/reference\/[a-z0-9-]+$/)
  })

  test('radar assets open their reference assessment', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Radar assets are shown from the md breakpoint')
    await page.goto('/')
    await page
      .getByRole('list', { name: 'Featured reference assessments' })
      .getByRole('link', { name: 'Bitcoin reference assessment' })
      .click()
    await expect(page).toHaveURL(/\/app\/reference\/bitcoin$/)
  })

  test('the hero search opens the global search', async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('region', { name: /Is this crypto project safe/ })
      .getByRole('button', { name: /Search a project/ })
      .click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('hero actions are reachable by keyboard', async ({ page }) => {
    await page.goto('/')
    const browse = page
      .getByRole('region', { name: /Is this crypto project safe/ })
      .getByRole('link', { name: 'Browse projects' })
    await expect(browse).toBeVisible()
    for (let i = 0; i < 30; i += 1) {
      await page.keyboard.press('Tab')
      if (await browse.evaluate((el) => el === document.activeElement)) break
    }
    await expect(browse).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/app$/)
  })

  test('does not download wallet code on the landing page', async ({ page }) => {
    const scripts: string[] = []
    page.on('request', (request) => {
      if (request.resourceType() === 'script') scripts.push(request.url())
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(scripts.filter((url) => /rainbowkit|wagmi|walletconnect/i.test(url))).toEqual(
      [],
    )
  })
})
