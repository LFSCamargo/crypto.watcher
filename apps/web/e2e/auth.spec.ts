import type { Page } from '@playwright/test'
import {
  TAKEN_WALLET,
  VALID_OTP,
  VALID_PASSWORD,
  VALID_RESET_TOKEN,
  expect,
  test,
} from './fixtures'

async function enterOtp(page: Page, code = VALID_OTP) {
  await page.getByLabel('One-time code').fill(code)
  await page.getByRole('button', { name: /Verify and continue/ }).click()
}

async function signIn(page: Page, password = VALID_PASSWORD) {
  await page.getByLabel('Email').fill('ada@example.com')
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

test.describe('registration', () => {
  test('registration → OTP → onboarding → app', async ({ page, api }) => {
    await page.goto('/auth/signup')
    await page.getByLabel('Email').fill('new@example.com')
    await page.getByLabel('Password', { exact: true }).fill(VALID_PASSWORD)
    await page.getByLabel('Confirm password').fill(VALID_PASSWORD)
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Verify your email')
    await enterOtp(page)

    await expect(page).toHaveURL(/\/auth\/onboarding$/)
    await expect(page.getByText('Step 1 of 3')).toBeVisible()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByLabel('Wallet address').fill(TAKEN_WALLET)
    await page.getByRole('button', { name: 'Link and finish' }).click()
    await expect(page.getByRole('alert')).toHaveText(/already linked to another account/)
    await page.getByRole('button', { name: 'Skip for now' }).click()

    await expect(page).toHaveURL(/\/app$/)
    expect(api.user?.email).toBe('new@example.com')
  })

  test('reloading onboarding keeps a signed-in member there', async ({ page, api }) => {
    api.signIn()
    await page.goto('/auth/onboarding')
    await expect(page.getByRole('heading', { name: 'How scores work' })).toBeVisible()
    await expect(page).toHaveURL(/\/auth\/onboarding$/)
  })

  test('a taken email offers sign-in instead', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.getByLabel('Email').fill('taken@example.com')
    await page.getByLabel('Password', { exact: true }).fill(VALID_PASSWORD)
    await page.getByLabel('Confirm password').fill(VALID_PASSWORD)
    await page.getByRole('button', { name: 'Create account' }).click()
    await page.getByRole('alert').getByRole('link', { name: 'Sign in instead' }).click()
    await expect(page).toHaveURL(/\/auth\/signin$/)
  })
})

test.describe('sign in', () => {
  test('returns to the page that asked for sign-in', async ({ page }) => {
    await page.goto('/app/analysis-request')
    await page.getByRole('link', { name: 'Sign in to continue' }).click()
    await expect(page).toHaveURL(/\/auth\/signin\?next=%2Fapp%2Fanalysis-request$/)
    await signIn(page)
    await enterOtp(page)
    await expect(page).toHaveURL(/\/app\/analysis-request$/)
    await expect(page.getByLabel('Project name')).toBeVisible()
  })

  test('incorrect credentials and codes are explained inline', async ({ page }) => {
    await page.goto('/auth/signin')
    await signIn(page, 'wrong-password')
    await expect(page.getByRole('alert')).toHaveText('Email or password is incorrect.')

    await signIn(page)
    await enterOtp(page, '000000')
    await expect(page.getByRole('alert')).toHaveText(/incorrect or has expired/)
  })

  test('the code page survives a reload', async ({ page }) => {
    await page.goto('/auth/signin')
    await signIn(page)
    await expect(page).toHaveURL(/\/auth\/verify-otp$/)
    await page.reload()
    await expect(page.getByText('ada@example.com')).toBeVisible()
    await enterOtp(page)
    await expect(page).toHaveURL(/\/app$/)
  })

  test('resending a code starts a cooldown', async ({ page }) => {
    await page.goto('/auth/signin')
    await signIn(page)
    await page.getByRole('button', { name: 'Resend code' }).click()
    await expect(page.getByRole('button', { name: /Resend code in \d+s/ })).toBeDisabled()
    await expect(page.getByRole('status')).toContainText('A new code is on its way')
  })

  test('external destinations are ignored', async ({ page }) => {
    await page.goto('/auth/signin?next=%2F%2Fevil.example%2Fsteal')
    await signIn(page)
    await enterOtp(page)
    await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/app$|localhost:\d+\/app$/)
  })

  test('network failures are distinguished from bad credentials', async ({
    page,
    api,
  }) => {
    api.failures.add('POST /auth/login')
    await page.goto('/auth/signin')
    await signIn(page)
    await expect(page.getByRole('alert')).toHaveText(/Something went wrong on our side/)
  })
})

test.describe('password recovery', () => {
  test('forgot password confirms without revealing the account', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    await page.getByLabel('Email').fill('anyone@example.com')
    await page.getByRole('button', { name: 'Send reset link' }).click()
    await expect(page.getByRole('status')).toContainText(
      'If an account exists for anyone@example.com',
    )
  })

  test('a valid reset link leads back to sign in', async ({ page }) => {
    await page.goto(`/auth/reset-password?token=${VALID_RESET_TOKEN}`)
    await page.getByLabel('New password', { exact: true }).fill(VALID_PASSWORD)
    await page.getByLabel('Confirm password').fill(VALID_PASSWORD)
    await page.getByRole('button', { name: 'Update password' }).click()
    await expect(page).toHaveURL(/\/auth\/signin\?reset=1$/)
    await expect(page.getByRole('status')).toHaveText(/Password updated/)
  })

  test('an expired reset link offers a new one', async ({ page }) => {
    await page.goto('/auth/reset-password?token=expired')
    await page.getByLabel('New password', { exact: true }).fill(VALID_PASSWORD)
    await page.getByLabel('Confirm password').fill(VALID_PASSWORD)
    await page.getByRole('button', { name: 'Update password' }).click()
    await page
      .getByRole('alert')
      .getByRole('link', { name: 'Request a new link' })
      .click()
    await expect(page).toHaveURL(/\/auth\/forgot-password$/)
  })
})
