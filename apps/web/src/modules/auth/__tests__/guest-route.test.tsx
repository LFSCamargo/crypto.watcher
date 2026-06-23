import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GuestRoute } from '../components/guest-route'

const useAuthStatus = vi.fn()

vi.mock('../hooks/use-session', () => ({
  useAuthStatus: () => useAuthStatus(),
}))

function renderGuestRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/auth/signin" element={<p>Sign in form</p>} />
        </Route>
        <Route path="/app" element={<p>App home</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('GuestRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders child routes for guests once auth status is ready', () => {
    useAuthStatus.mockReturnValue({
      isAuthenticated: false,
      isReady: true,
    })

    renderGuestRoute('/auth/signin')

    expect(screen.getByText('Sign in form')).toBeInTheDocument()
  })

  it('redirects authenticated users away from auth routes', () => {
    useAuthStatus.mockReturnValue({
      isAuthenticated: true,
      isReady: true,
    })

    renderGuestRoute('/auth/signin')

    expect(screen.getByText('App home')).toBeInTheDocument()
    expect(screen.queryByText('Sign in form')).not.toBeInTheDocument()
  })

  it('does not flash guest content while auth status is loading', () => {
    useAuthStatus.mockReturnValue({
      isAuthenticated: false,
      isReady: false,
    })

    renderGuestRoute('/auth/signin')

    expect(screen.queryByText('Sign in form')).not.toBeInTheDocument()
    expect(screen.queryByText('App home')).not.toBeInTheDocument()
  })
})
