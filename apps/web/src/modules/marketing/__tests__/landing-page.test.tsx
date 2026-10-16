import { cleanup, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LandingPage } from '../pages/landing-page'
import { renderWithProviders } from '../../../test/render'
import { useSession } from '../../../store/session'

function renderLanding() {
  return renderWithProviders(<LandingPage />)
}

describe('LandingPage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify([]), { status: 200 })),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    useSession.setState({ user: undefined })
  })

  it('renders a single page heading', () => {
    renderLanding()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('separates browsing from account creation in the hero', () => {
    renderLanding()
    const hero = screen.getByRole('region', { name: /Is this crypto project safe/ })
    expect(within(hero).getByRole('link', { name: 'Browse projects' })).toHaveAttribute(
      'href',
      '/app',
    )
    expect(within(hero).getByRole('link', { name: 'Get started' })).toHaveAttribute(
      'href',
      '/auth/signup',
    )
  })

  it('offers signed-in members a review request instead of sign-up', () => {
    useSession.setState({
      user: { id: 'u1', email: 'ada@example.com', nickname: 'ada', role: 'user' },
    })
    renderLanding()
    const hero = screen.getByRole('region', { name: /Is this crypto project safe/ })
    expect(
      within(hero).queryByRole('link', { name: 'Get started' }),
    ).not.toBeInTheDocument()
    expect(within(hero).getByRole('link', { name: 'Request a review' })).toHaveAttribute(
      'href',
      '/app/analysis-request',
    )
  })

  it('labels the report preview as illustrative', () => {
    renderLanding()
    const preview = screen.getByRole('figure', { name: /Illustrative report preview/ })
    expect(within(preview).getByText(/Illustrative example/)).toBeInTheDocument()
    expect(within(preview).getByText('/ 100')).toBeInTheDocument()
  })

  it('explains the review lifecycle in order', () => {
    renderLanding()
    const lifecycle = screen.getByRole('list', { name: 'Review lifecycle' })
    const steps = within(lifecycle)
      .getAllByRole('listitem')
      .map((item) => within(item).getByRole('heading').textContent)
    expect(steps).toEqual([
      'Review requested',
      'In analysis',
      'Governor review',
      'Report published',
      'Score shown',
    ])
  })

  it('labels curated assets as reference assessments and links to them', () => {
    renderLanding()
    const section = screen.getByRole('region', { name: 'Reference assessments' })
    const links = within(section).getAllByRole('link', { name: /reference assessment/i })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link.getAttribute('href')).toMatch(/^\/app\/reference\//)
    }
    expect(within(section).getByText(/not council reports/i)).toBeInTheDocument()
  })

  it('presents governance honestly as pre-launch', () => {
    renderLanding()
    const section = screen.getByRole('region', {
      name: 'Governance, built in from day one',
    })
    expect(within(section).getByText('Pre-launch · CWT not minted')).toBeInTheDocument()
    expect(
      within(section).getByRole('link', { name: 'See governance status' }),
    ).toHaveAttribute('href', '/app/governance')
    expect(
      within(section).getByText(/never on individual project scores/i),
    ).toBeInTheDocument()
    expect(screen.queryByText('Governed by CWT holders')).not.toBeInTheDocument()
  })

  it('links the main resources', () => {
    renderLanding()
    const section = screen.getByRole('region', { name: 'Learn how it works' })
    for (const path of ['/docs/whitepaper', '/docs/tokenomics', '/docs/faq', '/blog']) {
      expect(
        within(section)
          .getAllByRole('link')
          .some((link) => link.getAttribute('href') === path),
      ).toBe(true)
    }
    expect(within(section).getByRole('link', { name: /Read the story/ })).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/blog\/[a-z-]+$/),
    )
  })

  it('makes no unsupported volume or payment claims', () => {
    const { container } = renderLanding()
    const text = container.textContent ?? ''
    expect(text).not.toMatch(/100\+/)
    expect(text).not.toMatch(/pay (a|the) review fee/i)
    expect(text).not.toMatch(/fees? (are )?collected/i)
    expect(text).toMatch(/free during launch/i)
  })
})
