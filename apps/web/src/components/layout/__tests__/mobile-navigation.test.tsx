import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MobileNavigation } from '../mobile-navigation'
import { renderWithProviders } from '../../../test/render'
import { ThemeProvider } from '../../../lib/theme/theme-provider'
import { useSession, type SessionUser } from '../../../store/session'

const member: SessionUser = {
  id: 'u1',
  email: 'ada@example.com',
  nickname: 'ada',
  role: 'user',
}

function renderNav(route = '/app') {
  return renderWithProviders(
    <ThemeProvider>
      <MobileNavigation />
    </ThemeProvider>,
    { route },
  )
}

async function openMenu() {
  const user = userEvent.setup()
  const trigger = screen.getByRole('button', { name: 'Open menu' })
  await user.click(trigger)
  return { user, trigger, sheet: await screen.findByRole('dialog', { name: 'Menu' }) }
}

describe('MobileNavigation', () => {
  afterEach(() => {
    useSession.setState({ user: undefined })
    vi.unstubAllGlobals()
  })

  it('keeps projects, analysis and governance one tap away', () => {
    renderNav()
    const bar = screen.getByRole('navigation', { name: 'Mobile' })
    for (const label of ['Projects', 'In Analysis', 'Governance']) {
      expect(within(bar).getByRole('link', { name: label })).toBeInTheDocument()
    }
    expect(within(bar).getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('reveals every resource and guest account action in the menu sheet', async () => {
    renderNav()
    const { sheet } = await openMenu()
    for (const label of [
      'Blog',
      'Introduction',
      'Whitepaper',
      'Tokenomics',
      'Governance',
      'FAQ',
    ]) {
      expect(
        within(sheet).getByRole('link', { name: new RegExp(label) }),
      ).toBeInTheDocument()
    }
    expect(within(sheet).getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/auth/signin',
    )
    expect(within(sheet).getByRole('link', { name: 'Get started' })).toHaveAttribute(
      'href',
      '/auth/signup',
    )
  })

  it('offers account actions to signed-in users and signs out', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    useSession.setState({ user: member })
    renderNav()
    const { user, sheet } = await openMenu()
    expect(within(sheet).getByRole('link', { name: 'Profile' })).toHaveAttribute(
      'href',
      '/app/profile',
    )
    expect(within(sheet).getByRole('link', { name: 'Request analysis' })).toHaveAttribute(
      'href',
      '/app/analysis-request',
    )
    await user.click(within(sheet).getByRole('button', { name: 'Sign out' }))
    await waitFor(() => expect(useSession.getState().user).toBeUndefined())
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/logout'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('closes after choosing a destination', async () => {
    renderNav()
    const { user, sheet } = await openMenu()
    await user.click(within(sheet).getByRole('link', { name: /FAQ/ }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('restores focus to the trigger when dismissed with Escape', async () => {
    renderNav()
    const { user, trigger } = await openMenu()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })
})
