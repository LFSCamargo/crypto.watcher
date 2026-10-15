import { expect, test, VALID_OTP, VALID_PASSWORD } from './fixtures'

test.describe('compatibility redirects', () => {
  const redirects: [string, RegExp][] = [
    ['/projects', /\/app$/],
    ['/projects/bitcoin', /\/app\/reference\/bitcoin$/],
    ['/profile', /\/app\/profile$/],
    ['/analysis', /\/app\/in-analysis$/],
    ['/app/projects/aave/vote', /\/app\/projects\/aave$/],
  ]

  for (const [from, to] of redirects) {
    test(`${from} redirects`, async ({ page }) => {
      await page.goto(from)
      await expect(page).toHaveURL(to)
    })
  }

  test('unknown routes render the not-found page', async ({ page }) => {
    await page.goto('/definitely-not-a-route')
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })
})

test.describe('browsing without an account', () => {
  test('catalog search deep link opens a reference asset', async ({ page }) => {
    await page.goto('/app?search=bitcoin')
    const card = page.getByRole('link', { name: /Bitcoin/ }).first()
    await expect(card).toBeVisible()
    await card.click()
    await expect(page).toHaveURL(/\/app\/reference\/bitcoin$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Bitcoin' })).toBeVisible()
  })

  test('API project detail renders the published score', async ({ page }) => {
    await page.goto('/app/projects/aave')
    await expect(page.getByRole('heading', { level: 1, name: 'Aave' })).toBeVisible()
    await expect(page.getByText('86.5')).toBeVisible()
  })

  test('missing API project shows a recoverable not-found state', async ({ page }) => {
    await page.goto('/app/projects/does-not-exist')
    await expect(page.getByRole('heading', { name: 'Project not found' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to projects' })).toBeVisible()
  })

  test('governance proposals are reachable without a wallet', async ({ page }) => {
    await page.goto('/app/governance')
    const proposal = page.getByRole('link', { name: /tokenomics specialist/ })
    await expect(proposal).toBeVisible()
    await proposal.click()
    await expect(page).toHaveURL(/\/app\/governance\/1$/)
    await expect(
      page.getByText('Add a tokenomics specialist to the governor council'),
    ).toBeVisible()
  })
})

test.describe('account entry', () => {
  test('Get started leads guests to registration', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Get started' }).first().click()
    await expect(page).toHaveURL(/\/auth\/signup$/)
  })

  test('sign in with OTP establishes a session', async ({ page, api }) => {
    await page.goto('/auth/signin')
    await page.getByLabel('Email').fill('ada@example.com')
    await page.getByLabel('Password', { exact: true }).fill(VALID_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/auth\/verify-otp$/)
    await page.getByLabel('One-time code').fill(VALID_OTP)
    await page.getByRole('button', { name: /Verify and continue/ }).click()
    await expect(page).not.toHaveURL(/\/auth\//)
    expect(api.user?.email).toBe('ada@example.com')
  })
})

test.describe('analysis requests', () => {
  test('guests are asked to sign in before requesting a review', async ({ page }) => {
    await page.goto('/app/analysis-request')
    await expect(page.getByRole('link', { name: /Sign in/ }).last()).toBeVisible()
  })

  test('signed-in users can submit a request', async ({ page, api }) => {
    api.signIn()
    await page.goto('/app/analysis-request')
    await page.getByLabel('Project name').fill('Test Protocol')
    await page.getByLabel('Project URL').fill('https://test.example')
    await page
      .getByLabel(/What should we review/)
      .fill('Please review the staking contracts.')
    await page.getByRole('button', { name: /Submit/ }).click()
    await expect
      .poll(() =>
        api.analysisRequests.some((item) => item.projectName === 'Test Protocol'),
      )
      .toBe(true)
  })

  test('the queue lists existing requests', async ({ page }) => {
    await page.goto('/app/in-analysis')
    await expect(page.getByText('Orbit Bridge')).toBeVisible()
  })
})
