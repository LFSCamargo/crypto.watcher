import { cleanup, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { OnboardingPage } from '../pages/onboarding-page'
import { mockApi } from '../../../test/mock-api'
import { currentLocation, renderRoutes } from '../../../test/render-routes'
import { useSession } from '../../../store/session'

const member = {
  id: 'u1',
  email: 'ada@example.com',
  nickname: 'ada',
  role: 'user' as const,
}
const ADDRESS = '0x1111111111111111111111111111111111111111'

function renderOnboarding(search = '') {
  return renderRoutes(
    [{ path: '/auth/onboarding', element: <OnboardingPage /> }],
    `/auth/onboarding${search}`,
  )
}

async function goToWalletStep() {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: 'Next' }))
  return user
}

describe('OnboardingPage', () => {
  beforeEach(() => useSession.setState({ user: member }))

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    useSession.setState({ user: undefined })
  })

  it('redirects guests to sign in once the session check finishes', async () => {
    useSession.setState({ user: undefined })
    mockApi({ 'GET /users/me': [401, { message: 'Unauthorized' }] })
    renderOnboarding()
    await waitFor(() => expect(currentLocation()).toBe('/auth/signin'))
  })

  it('keeps signed-in users on onboarding after a reload', async () => {
    useSession.setState({ user: undefined })
    mockApi({ 'GET /users/me': [200, member] })
    renderOnboarding()
    expect(
      await screen.findByRole('heading', { name: 'How scores work' }),
    ).toBeInTheDocument()
    expect(currentLocation()).toBe('/auth/onboarding')
  })

  it('is three short steps with progress and back navigation', async () => {
    renderOnboarding()
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('How scores work')
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
  })

  it('makes no comment-fee claim', async () => {
    const { container } = renderOnboarding()
    await goToWalletStep()
    expect(container.textContent).not.toMatch(/anti-spam fee|fee applies/i)
  })

  it('skips straight to the intended destination', async () => {
    renderOnboarding('?next=%2Fapp%2Fanalysis-request')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Skip' }))
    await waitFor(() => expect(currentLocation()).toBe('/app/analysis-request'))
  })

  it('explains that linking an address needs no signature', async () => {
    renderOnboarding()
    await goToWalletStep()
    expect(screen.getByText('Step 3 of 3 · Optional')).toBeInTheDocument()
    expect(
      screen.getByText(/does not connect your wallet or ask you to sign/i),
    ).toBeInTheDocument()
  })

  it('validates the address before calling the API', async () => {
    const fetchMock = mockApi({})
    renderOnboarding()
    const user = await goToWalletStep()
    await user.type(screen.getByLabelText('Wallet address'), '0x123')
    await user.click(screen.getByRole('button', { name: 'Link and finish' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Enter a full 0x address (42 characters).',
    )
    expect(fetchMock.mock.calls.map(([url]) => String(url))).not.toContainEqual(
      expect.stringContaining('/auth/link-public-key'),
    )
  })

  it('reports an address already linked to another account', async () => {
    mockApi({
      'POST /auth/link-public-key': [
        409,
        { message: 'Wallet already linked to another account' },
      ],
    })
    renderOnboarding()
    const user = await goToWalletStep()
    await user.type(screen.getByLabelText('Wallet address'), ADDRESS)
    await user.click(screen.getByRole('button', { name: 'Link and finish' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This address is already linked to another account.',
    )
  })

  it('links the address and finishes', async () => {
    mockApi({
      'POST /auth/link-public-key': [200, { user: { ...member, publicKey: ADDRESS } }],
    })
    renderOnboarding('?next=%2Fapp%2Fgovernance')
    const user = await goToWalletStep()
    await user.type(screen.getByLabelText('Wallet address'), ADDRESS)
    await user.click(screen.getByRole('button', { name: 'Link and finish' }))
    await waitFor(() => expect(currentLocation()).toBe('/app/governance'))
    expect(useSession.getState().user?.publicKey).toBe(ADDRESS)
  })
})
