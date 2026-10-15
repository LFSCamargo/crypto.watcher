import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppHeader } from '../app-header'
import { renderWithProviders } from '../../../test/render'
import { ThemeProvider } from '../../../lib/theme/theme-provider'
import { useSession, type SessionUser } from '../../../store/session'

const member: SessionUser = {
  id: 'u1',
  email: 'ada@example.com',
  nickname: 'ada',
  role: 'user',
}

function renderHeader(route = '/app', onOpenSearch = vi.fn()) {
  renderWithProviders(
    <ThemeProvider>
      <AppHeader onOpenSearch={onOpenSearch} />
    </ThemeProvider>,
    { route },
  )
  return { onOpenSearch }
}

describe('AppHeader', () => {
  afterEach(() => useSession.setState({ user: undefined }))

  it('exposes the primary destinations including governance', () => {
    renderHeader()
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    for (const label of ['Projects', 'In Analysis', 'Governance']) {
      expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument()
    }
    expect(within(nav).getByRole('button', { name: /Resources/ })).toBeInTheDocument()
  })

  it('marks the active route with aria-current', () => {
    renderHeader('/app/governance')
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(nav).getByRole('link', { name: 'Governance' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(nav).getByRole('link', { name: 'Projects' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('shows sign in and get started for guests', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute(
      'href',
      '/auth/signup',
    )
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/auth/signin',
    )
    expect(
      screen.queryByRole('link', { name: 'Request analysis' }),
    ).not.toBeInTheDocument()
  })

  it('gives signed-in users a request analysis entry', async () => {
    useSession.setState({ user: member })
    renderHeader()
    expect(
      await screen.findByRole('button', { name: 'Account menu for ada' }),
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'Request analysis' })).toHaveAttribute(
      'href',
      '/app/analysis-request',
    )
    expect(screen.queryByRole('link', { name: 'Get started' })).not.toBeInTheDocument()
  })

  it('opens search from both the desktop field and the compact button', async () => {
    const user = userEvent.setup()
    const { onOpenSearch } = renderHeader()
    const buttons = screen.getAllByRole('button', { name: /Search projects/ })
    expect(buttons).toHaveLength(2)
    for (const button of buttons) await user.click(button)
    expect(onOpenSearch).toHaveBeenCalledTimes(2)
  })

  it('uses the shared glass navigation surface', () => {
    renderHeader()
    expect(screen.getByRole('banner')).toHaveClass('glass-nav')
  })
})
