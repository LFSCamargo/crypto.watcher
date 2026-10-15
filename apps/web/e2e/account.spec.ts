import { expect, test } from './fixtures'

const REVIEWER = '0x00000000000000000000000000000000000000c1'

test.describe('Profile', () => {
  test('saves profile edits and shows request history', async ({ page, api }) => {
    api.signIn({ id: 'user-2' })
    await page.goto('/app/profile')

    await expect(page.getByRole('region', { name: 'Your requests' })).toContainText(
      'Orbit Bridge',
    )
    await page.getByLabel('Bio').fill('Security researcher')
    await page.getByRole('button', { name: 'Save profile' }).click()

    await expect(
      page.getByRole('status').filter({ hasText: 'Profile saved.' }),
    ).toBeVisible()
    expect(api.calls).toContainEqual(
      expect.objectContaining({
        method: 'PATCH',
        path: '/users/me',
        body: expect.objectContaining({ bio: 'Security researcher' }),
      }),
    )
  })

  test('keeps edits when saving fails', async ({ page, api }) => {
    api.signIn()
    api.failures.add('PATCH /users/me')
    await page.goto('/app/profile')

    await page.getByLabel('Bio').fill('Draft')
    await page.getByRole('button', { name: 'Save profile' }).click()

    await expect(page.getByRole('alert')).toContainText("Your profile wasn't saved.")
    await expect(page.getByLabel('Bio')).toHaveValue('Draft')
  })
})

test.describe('Reviewer credentials', () => {
  test('shows council membership for a reviewer address', async ({ page }) => {
    await page.goto(`/app/u/${REVIEWER}`)

    await expect(
      page.getByRole('heading', { level: 1, name: 'Reviewer credentials' }),
    ).toBeVisible()
    await expect(page.getByText('Governor council member', { exact: true })).toBeVisible()
    await expect(
      page.getByText(/Only governor council members publish official scores/),
    ).toBeVisible()
  })

  test('rejects a malformed address without calling the API', async ({ page, api }) => {
    await page.goto('/app/u/not-a-wallet')

    await expect(
      page.getByRole('heading', { name: "That isn't a wallet address" }),
    ).toBeVisible()
    expect(api.calls.some((call) => call.path.startsWith('/reputation'))).toBe(false)
  })
})

test.describe('Protocol governance', () => {
  test('lists proposals and opens one with its vote panel', async ({ page }) => {
    await page.goto('/app/governance')

    await page.getByRole('link', { name: /tokenomics specialist/ }).click()
    await expect(page).toHaveURL(/\/app\/governance\/1$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'tokenomics specialist',
    )

    const panel = page.getByRole('region', { name: 'Your vote' })
    await expect(panel).toContainText(/In-app voting isn't enabled|Connect wallet/)
    await expect(panel).toContainText('never change a project')
  })

  test('shows that voting ended for executed proposals', async ({ page }) => {
    await page.goto('/app/governance/2')

    await expect(page.getByRole('region', { name: 'Your vote' })).toContainText(
      'Voting has ended. Outcome: Executed.',
    )
  })

  test('explains a missing proposal', async ({ page }) => {
    await page.goto('/app/governance/999')
    await expect(page.getByRole('heading', { name: 'Proposal not found' })).toBeVisible()
  })
})

test.describe('Project administration', () => {
  test('members without team access see a forbidden state', async ({ page, api }) => {
    api.signIn()
    await page.goto('/app/admin')

    await expect(
      page.getByRole('heading', { name: 'Team or admin access required' }),
    ).toBeVisible()
    await expect(page.getByRole('form', { name: 'Create a project' })).toHaveCount(0)
  })

  test('team members create a project and move it forward', async ({ page, api }) => {
    api.signIn({ role: 'team' })
    await page.goto('/app/admin')

    const create = page.getByRole('form', { name: 'Create a project' })
    await create.getByLabel('Project name').fill('Nova DEX')
    await create.getByRole('button', { name: 'Create project' }).click()
    await expect(create.getByRole('status')).toHaveText('Nova DEX was created.')

    const move = page.getByRole('form', { name: 'Move a project forward' })
    await move.getByLabel('Project').selectOption({ label: 'Nova DEX' })
    await move.getByRole('button', { name: 'Move to Awaiting governor review' }).click()
    await expect(move.getByRole('status')).toHaveText(
      'Nova DEX is now Awaiting governor review.',
    )
  })

  test('a server-side refusal is shown even when the UI allowed the action', async ({
    page,
    api,
  }) => {
    api.signIn({ role: 'team' })
    await page.goto('/app/admin')
    api.user = { ...api.user!, role: 'user' }

    const create = page.getByRole('form', { name: 'Create a project' })
    await create.getByLabel('Project name').fill('Nova DEX')
    await create.getByRole('button', { name: 'Create project' }).click()

    await expect(create.getByRole('alert')).toContainText("doesn't have permission")
  })
})
