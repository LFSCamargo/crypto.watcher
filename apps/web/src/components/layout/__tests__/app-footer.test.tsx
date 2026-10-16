import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppFooter } from '../app-footer'
import { renderWithProviders } from '../../../test/render'

describe('AppFooter', () => {
  it('groups product, resource and account links', () => {
    renderWithProviders(<AppFooter />)
    const product = screen.getByRole('list', { name: 'Product' })
    expect(within(product).getByRole('link', { name: /Projects/ })).toHaveAttribute(
      'href',
      '/app',
    )
    expect(within(product).getByRole('link', { name: /Governance/ })).toHaveAttribute(
      'href',
      '/app/governance',
    )
    const resources = screen.getByRole('list', { name: 'Resources' })
    expect(within(resources).getByRole('link', { name: /Whitepaper/ })).toHaveAttribute(
      'href',
      '/docs/whitepaper',
    )
    expect(screen.getByRole('list', { name: 'Account' })).toBeInTheDocument()
  })

  it('describes review requests without claiming a fee is charged', () => {
    renderWithProviders(<AppFooter />)
    expect(screen.queryByText(/pay the review fee/i)).not.toBeInTheDocument()
    expect(screen.getByText(/free during launch/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Submit a project' })).toHaveAttribute(
      'href',
      '/app/analysis-request',
    )
  })

  it('keeps the not-financial-advice disclaimer', () => {
    renderWithProviders(<AppFooter />)
    expect(screen.getByText(/Not financial advice/)).toBeInTheDocument()
  })
})
