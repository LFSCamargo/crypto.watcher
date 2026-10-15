import { expect, test } from './fixtures'

test.describe('project catalog', () => {
  test('lists council projects ahead of labelled reference assessments', async ({
    page,
  }) => {
    await page.goto('/app')
    await expect(page).toHaveTitle(/Browse Projects/)
    const council = page.getByRole('region', { name: 'Council projects' })
    await expect(council.getByRole('heading', { name: 'Aave' })).toBeVisible()
    await expect(council.getByText('Report published')).toBeVisible()
    await expect(council.getByText('In analysis')).toBeVisible()

    const references = page.getByRole('region', { name: 'Reference assessments' })
    await expect(references.getByText(/not governor council reports/)).toBeVisible()
    await expect(references.getByText(/^Showing 24 of \d+$/)).toBeVisible()
    await references.getByRole('button', { name: 'Show more' }).click()
    await expect(references.getByText(/^Showing 48 of \d+$/)).toBeVisible()
  })

  test('typing a search updates the URL without stacking history', async ({ page }) => {
    await page.goto('/')
    await page.goto('/app')
    await page.getByRole('searchbox', { name: 'Search projects' }).fill('newdex')
    await expect(page).toHaveURL(/\/app\?search=newdex$/)
    const council = page.getByRole('region', { name: 'Council projects' })
    await expect(council.getByRole('heading', { name: 'NewDex' })).toBeVisible()
    await expect(council.getByRole('heading', { name: 'Aave' })).toHaveCount(0)

    await page.goBack()
    await expect(page).toHaveURL(/\/$/)
  })

  test('category chips are toggle buttons that keyboard users can operate', async ({
    page,
  }) => {
    await page.goto('/app')
    const filters = page.getByRole('group', {
      name: 'Filter reference assessments by category',
    })
    const defi = filters.getByRole('button', { name: 'DeFi' })
    await defi.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/category=defi/)
    await expect(defi).toHaveAttribute('aria-pressed', 'true')
    await expect(defi).toBeFocused()
  })

  test('an empty filter result can be cleared', async ({ page }) => {
    await page.goto('/app?search=zzzz-no-match&category=nft')
    await expect(
      page.getByText('No reference assessments match your filters.'),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Clear filters' }).click()
    await expect(page).toHaveURL(/\/app$/)
  })
})

test.describe('council project report', () => {
  test('shows status, official score provenance and a separate reference link', async ({
    page,
  }) => {
    await page.goto('/app/projects/aave')
    await expect(page.getByRole('heading', { level: 1, name: 'Aave' })).toBeVisible()
    const score = page.getByRole('region', { name: 'Official safety score' })
    await expect(score.getByText('86.5')).toBeVisible()
    await expect(
      score.getByText(/Published by the governor council · Round \d+/),
    ).toBeVisible()
    await expect(page.getByText('Council verdict')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Mark (safe|unsafe)/ })).toHaveCount(0)

    await page.getByRole('link', { name: 'View the reference assessment' }).click()
    await expect(page).toHaveURL(/\/app\/reference\/aave$/)
    await expect(page.getByRole('note', { name: 'Reference assessment' })).toContainText(
      'not a governor council report',
    )
  })

  test('explains the lifecycle while a project is still in analysis', async ({
    page,
  }) => {
    await page.goto('/app/projects/newdex')
    const score = page.getByRole('region', { name: 'Official safety score' })
    await expect(score.getByText('No official score yet')).toBeVisible()
    const lifecycle = page.getByRole('list', { name: 'Review lifecycle' })
    await expect(lifecycle.locator('[aria-current="step"]')).toHaveText(/In analysis/)
  })

  test('the retired vote route lands on the project report', async ({ page }) => {
    await page.goto('/app/projects/aave/vote')
    await expect(page).toHaveURL(/\/app\/projects\/aave$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Aave' })).toBeVisible()
  })
})

test.describe('reference assessment', () => {
  test('does not promote trading venues and offers a council review request', async ({
    page,
  }) => {
    await page.goto('/app/reference/bitcoin')
    await expect(page).toHaveTitle(/Bitcoin Reference Assessment/)
    await expect(page.getByText(/Recommended to trade on/)).toHaveCount(0)
    await page.getByRole('link', { name: 'Request a council review' }).click()
    await expect(page).toHaveURL(/\/app\/analysis-request$/)
  })
})
