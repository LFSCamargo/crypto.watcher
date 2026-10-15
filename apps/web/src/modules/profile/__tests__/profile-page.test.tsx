import { act, cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionUser } from '../../../store/session'
import { useSession } from '../../../store/session'
import { mockApi } from '../../../test/mock-api'
import { renderRoutes } from '../../../test/render-routes'
import { ProfilePage } from '../pages/profile-page'

vi.mock('../components/profile-avatar-upload', () => ({
  ProfileAvatarUpload: ({ avatarUrl }: { avatarUrl: string }) => (
    <div data-testid="avatar-upload">{avatarUrl ? 'has-avatar' : 'no-avatar'}</div>
  ),
}))

const member: SessionUser = {
  id: '003c533c-a637-48d4-8a11-7abc7b6ec655',
  email: 'ada@example.com',
  nickname: 'Ada',
  displayName: 'Ada Lovelace',
  avatarUrl: 'data:image/jpeg;base64,abc',
  bio: 'Builder',
  xAccount: '@ada',
  publicKey: null,
  walletAddress: null,
  role: 'user',
}

const noRequests = {
  'GET /analysis-requests/me': [200, { items: [] }] as [number, unknown],
}

const renderProfile = () =>
  renderRoutes([{ path: '/app/profile', element: <ProfilePage /> }], '/app/profile')

describe('ProfilePage', () => {
  afterEach(() => {
    cleanup()
    useSession.setState({ user: undefined })
  })

  it('asks guests to sign in and returns them to the profile', () => {
    mockApi({})
    renderProfile()

    expect(
      screen.getByRole('heading', { name: 'Sign in to manage your profile' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      expect.stringContaining('next=%2Fapp%2Fprofile'),
    )
  })

  it('hydrates the form when the session loads after mount', () => {
    mockApi(noRequests)
    renderProfile()

    act(() => useSession.setState({ user: member }))

    return waitFor(() => {
      expect(screen.getByLabelText('Nickname')).toHaveValue('Ada')
      expect(screen.getByLabelText('Display name')).toHaveValue('Ada Lovelace')
      expect(screen.getByLabelText('Bio')).toHaveValue('Builder')
      expect(screen.getByLabelText('X account')).toHaveValue('@ada')
      expect(screen.getByTestId('avatar-upload')).toHaveTextContent('has-avatar')
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ada')
    })
  })

  it('validates fields inline before saving', async () => {
    const user = userEvent.setup()
    const fetchMock = mockApi(noRequests)
    useSession.setState({ user: member })
    renderProfile()

    const nickname = screen.getByLabelText('Nickname')
    await user.clear(nickname)
    await user.type(nickname, 'A')
    await user.click(screen.getByRole('button', { name: 'Save profile' }))

    expect(nickname).toHaveAttribute('aria-invalid', 'true')
    expect(nickname).toHaveAccessibleDescription(/2–32 characters/)
    expect(nickname).toHaveFocus()
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false)
  })

  it('rejects a malformed public wallet address', async () => {
    const user = userEvent.setup()
    mockApi(noRequests)
    useSession.setState({ user: member })
    renderProfile()

    const field = screen.getByLabelText('Public wallet address')
    await user.type(field, 'not-a-wallet')
    await user.click(screen.getByRole('button', { name: 'Save profile' }))

    expect(field).toHaveAccessibleDescription(/0x followed by 40 letters or numbers/)
    expect(field).toHaveFocus()
  })

  it('saves changes and confirms in place', async () => {
    const user = userEvent.setup()
    const saved: unknown[] = []
    mockApi({
      ...noRequests,
      'PATCH /users/me': (body) => {
        saved.push(body)
        return [200, { ...member, bio: 'Researcher' }]
      },
    })
    useSession.setState({ user: member })
    renderProfile()

    const bio = screen.getByLabelText('Bio')
    await user.clear(bio)
    await user.type(bio, 'Researcher')
    await user.click(screen.getByRole('button', { name: 'Save profile' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Profile saved.')
    expect(saved[0]).toMatchObject({ bio: 'Researcher', nickname: 'Ada' })
    expect(useSession.getState().user?.bio).toBe('Researcher')
  })

  it('keeps edits and explains a failed save', async () => {
    const user = userEvent.setup()
    mockApi({ ...noRequests, 'PATCH /users/me': [500, { message: 'boom' }] })
    useSession.setState({ user: member })
    renderProfile()

    const bio = screen.getByLabelText('Bio')
    await user.clear(bio)
    await user.type(bio, 'Draft bio')
    await user.click(screen.getByRole('button', { name: 'Save profile' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Your profile wasn't saved.",
    )
    expect(bio).toHaveValue('Draft bio')
    expect(screen.getByRole('button', { name: 'Save profile' })).toBeEnabled()
  })

  it('shows wallet status and request history', async () => {
    mockApi({
      'GET /analysis-requests/me': [
        200,
        {
          items: [
            {
              id: 'r1',
              projectName: 'Orbit Bridge',
              status: 'in_review',
              createdAt: '2026-10-01T12:00:00.000Z',
            },
          ],
        },
      ],
    })
    useSession.setState({
      user: { ...member, walletAddress: '0x1234567890abcdef1234567890abcdef12345678' },
    })
    renderProfile()

    const wallet = screen.getByRole('region', { name: 'Wallet' })
    expect(
      within(wallet).getByText('0x1234567890abcdef1234567890abcdef12345678'),
    ).toBeInTheDocument()
    expect(
      within(wallet).getByText(/Protocol votes use the wallet you connect/),
    ).toBeInTheDocument()

    const requests = screen.getByRole('region', { name: 'Your requests' })
    expect(await within(requests).findByText('Orbit Bridge')).toBeInTheDocument()
    expect(within(requests).getByText('Under review')).toBeInTheDocument()
  })

  it('explains how to link a wallet when none is linked', () => {
    mockApi(noRequests)
    useSession.setState({ user: member })
    renderProfile()

    const wallet = screen.getByRole('region', { name: 'Wallet' })
    expect(within(wallet).getByText('No wallet linked')).toBeInTheDocument()
    expect(screen.queryByText(/Governor council/)).not.toBeInTheDocument()
  })

  it('shows council tools only to team and admin accounts', () => {
    mockApi(noRequests)
    useSession.setState({ user: { ...member, role: 'admin' } })
    renderProfile()

    expect(screen.getByText('Governor council')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open review queue' })).toHaveAttribute(
      'href',
      '/app/in-analysis',
    )
    expect(screen.getByRole('link', { name: 'Manage projects' })).toHaveAttribute(
      'href',
      '/app/admin',
    )
  })
})
