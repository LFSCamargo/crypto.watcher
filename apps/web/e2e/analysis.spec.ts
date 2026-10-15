import { expect, test } from './fixtures'

const REQUEST_PATH = '/app/analysis-request'

test.describe('review request journey', () => {
  test('guests sign in and come back to the request form', async ({ page }) => {
    await page.goto(REQUEST_PATH)
    await expect(page.getByRole('main').getByText(/free during launch/)).toBeVisible()
    await page.getByRole('link', { name: 'Sign in to continue' }).click()
    await expect(page).toHaveURL(/\/auth\/signin\?next=%2Fapp%2Fanalysis-request$/)
  })

  test('invalid details are flagged inline and nothing is sent', async ({
    page,
    api,
  }) => {
    api.signIn()
    await page.goto(REQUEST_PATH)
    await page.getByLabel('Project website').fill('orbit')
    await page.getByRole('button', { name: 'Submit request' }).click()

    await expect(page.getByText('Enter the project name.')).toBeVisible()
    await expect(
      page.getByText('Enter a full address starting with https://'),
    ).toBeVisible()
    await expect(page.getByLabel('Project name')).toBeFocused()
    expect(api.calls.some((call) => call.method === 'POST')).toBe(false)
  })

  test('a server failure keeps the details and a retry succeeds', async ({
    page,
    api,
  }) => {
    api.signIn()
    api.failures.add('POST /analysis-requests')
    await page.goto(REQUEST_PATH)
    await page.getByLabel('Project name').fill('Test Protocol')
    await page.getByLabel('Project website').fill('https://test.example')
    await page
      .getByLabel('What should the council look at?')
      .fill('Please review the staking contracts.')
    await page.getByRole('button', { name: 'Submit request' }).click()

    await expect(page.getByRole('alert')).toContainText('went wrong on our side')
    await expect(page.getByLabel('Project name')).toHaveValue('Test Protocol')

    api.failures.delete('POST /analysis-requests')
    await page.getByRole('button', { name: 'Submit request' }).click()
    await expect(page.getByRole('heading', { name: 'Request received' })).toBeFocused()
    await expect(
      page.getByRole('region', { name: 'Your requests' }).getByText('Test Protocol'),
    ).toBeVisible()

    await page.getByRole('link', { name: 'Open the review queue' }).click()
    const card = page.getByRole('article', { name: 'Test Protocol' })
    await expect(card.getByText('Received')).toBeVisible()
  })
})

test.describe('review queue', () => {
  test('explains request statuses and hides triage from members', async ({
    page,
    api,
  }) => {
    api.signIn()
    await page.goto('/app/in-analysis')
    await expect(
      page.getByRole('region', { name: 'What request statuses mean' }),
    ).toBeVisible()
    const card = page.getByRole('article', { name: 'Orbit Bridge' })
    await expect(card.getByText('Under review')).toBeVisible()
    await expect(card.getByRole('button')).toHaveCount(0)
  })

  test('team members move a request through triage', async ({ page, api }) => {
    api.signIn({ role: 'team' })
    await page.goto('/app/in-analysis')
    const card = page.getByRole('article', { name: 'Orbit Bridge' })
    await card.getByRole('button', { name: 'Accept' }).click()
    await expect(card.getByText('Accepted', { exact: true })).toBeVisible()
    expect(api.analysisRequests[0]?.status).toBe('approved')
    expect(api.analysisRequests[0]?.reviewNotes).toBeNull()
  })
})

test.describe('project discussion', () => {
  test('guests are invited to sign in; members post without fee prompts', async ({
    page,
    api,
  }) => {
    await page.goto('/app/projects/aave')
    await expect(page.getByRole('link', { name: 'Sign in to comment' })).toHaveAttribute(
      'href',
      '/auth/signin?next=%2Fapp%2Fprojects%2Faave',
    )

    api.signIn()
    await page.reload()
    await expect(page.getByText(/fee per comment|on-chain transaction/)).toHaveCount(0)
    await page.getByLabel('Add a comment').fill('The bridge contracts lack an audit.')
    await page.getByRole('button', { name: 'Post comment' }).click()
    await expect(page.getByText('The bridge contracts lack an audit.')).toBeVisible()
    await expect(page.getByLabel('Add a comment')).toHaveValue('')
  })
})
