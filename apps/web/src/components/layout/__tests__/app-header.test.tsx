import { cleanup, fireEvent, screen, within } from '@testing-library/react'
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

function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
  fireEvent.scroll(window)
}

function pill() {
  const element = screen.getByRole('banner').querySelector('[data-size]')
  if (!element) throw new Error('Header pill not rendered')
  return element
}

describe('AppHeader', () => {
  afterEach(() => {
    cleanup()
    useSession.setState({ user: undefined })
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  })

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

  it('shows sign in and get started for guests, returning them to the current page', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute(
      'href',
      '/auth/signup?next=%2Fapp',
    )
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/auth/signin?next=%2Fapp',
    )
    expect(
      screen.queryByRole('link', { name: 'Request a review' }),
    ).not.toBeInTheDocument()
  })

  it('gives signed-in users a request analysis entry', async () => {
    useSession.setState({ user: member })
    renderHeader()
    expect(
      await screen.findByRole('button', { name: 'Account menu for ada' }),
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'Request a review' })).toHaveAttribute(
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

  it('renders the navigation as a glass pill', () => {
    renderHeader()
    expect(pill()).toHaveClass('glass-nav', 'rounded-full')
  })

  it('starts expanded and compacts once the page scrolls down', () => {
    renderHeader()
    expect(pill()).toHaveAttribute('data-size', 'expanded')
    scrollTo(400)
    expect(pill()).toHaveAttribute('data-size', 'compact')
  })

  it('expands again when the page is scrolled back to the top', () => {
    renderHeader()
    scrollTo(400)
    scrollTo(0)
    expect(pill()).toHaveAttribute('data-size', 'expanded')
  })

  it('expands while hovered and compacts when the pointer leaves', async () => {
    const user = userEvent.setup()
    renderHeader()
    scrollTo(400)
    await user.hover(pill())
    expect(pill()).toHaveAttribute('data-size', 'expanded')
    await user.unhover(pill())
    expect(pill()).toHaveAttribute('data-size', 'compact')
  })

  it('stays expanded after a click until the page keeps scrolling down', () => {
    renderHeader()
    scrollTo(400)
    fireEvent.click(pill())
    expect(pill()).toHaveAttribute('data-size', 'expanded')
    scrollTo(420)
    expect(pill()).toHaveAttribute('data-size', 'expanded')
    scrollTo(600)
    expect(pill()).toHaveAttribute('data-size', 'compact')
  })

  it('keeps the search and home link names when compact', () => {
    renderHeader()
    scrollTo(400)
    expect(screen.getAllByRole('button', { name: /Search projects/ })).toHaveLength(2)
    expect(screen.getByRole('link', { name: /^Crypto Watcher/ })).toHaveAttribute(
      'href',
      '/',
    )
  })
})
