import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SessionUser } from '../../../store/session'
import { ProfilePage } from '../pages/profile-page'

const mockSetUser = vi.fn()
let sessionUser: SessionUser | undefined

vi.mock('../../../store/session', () => ({
  useSession: (selector: (state: { user?: SessionUser; setUser: typeof mockSetUser }) => unknown) =>
    selector({ user: sessionUser, setUser: mockSetUser }),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
}))

vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('../components/profile-avatar-upload', () => ({
  ProfileAvatarUpload: ({ avatarUrl }: { avatarUrl: string }) => (
    <div data-testid="avatar-upload">{avatarUrl ? 'has-avatar' : 'no-avatar'}</div>
  ),
}))

const fullUser: SessionUser = {
  id: '003c533c-a637-48d4-8a11-7abc7b6ec655',
  email: 'luizepauloxd@gmail.com',
  nickname: 'Little Luiz',
  displayName: 'Luiz',
  avatarUrl: 'data:image/jpeg;base64,abc',
  bio: 'Builder',
  xAccount: '@luiz',
  publicKey: null,
  walletAddress: null,
  role: 'user',
}

describe('ProfilePage', () => {
  beforeEach(() => {
    sessionUser = undefined
    vi.clearAllMocks()
  })

  const renderPage = () =>
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    )

  it('hydrates form fields when the session user loads after mount', () => {
    const { rerender } = renderPage()

    expect(screen.getByText(/sign in to manage your profile/i)).toBeInTheDocument()

    sessionUser = fullUser
    rerender(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText(/nickname/i)).toHaveValue('Little Luiz')
    expect(screen.getByLabelText(/display name/i)).toHaveValue('Luiz')
    expect(screen.getByLabelText(/description/i)).toHaveValue('Builder')
    expect(screen.getByLabelText(/x account/i)).toHaveValue('@luiz')
    expect(screen.getByTestId('avatar-upload')).toHaveTextContent('has-avatar')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Little Luiz')
  })
})
