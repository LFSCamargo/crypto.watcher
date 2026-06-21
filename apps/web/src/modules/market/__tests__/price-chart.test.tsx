import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PriceChart } from '../components/price-chart'

const history = Array.from({ length: 40 }, (_, index) => ({
  timestamp: index * 86_400_000,
  price: 100 + index,
}))

describe('PriceChart', () => {
  beforeEach(() => {
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 400,
      height: 160,
      top: 0,
      left: 0,
      right: 400,
      bottom: 160,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }))
  })
  it('renders range controls for full charts', () => {
    render(<PriceChart history={history} variant="full" defaultRange="1y" />)

    expect(screen.getByRole('button', { name: '1D' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1Y' })).toBeInTheDocument()
  })

  it('switches chart range when a period is selected', async () => {
    const user = userEvent.setup()
    render(<PriceChart history={history} variant="full" defaultRange="1y" showRangeSelector />)

    await user.click(screen.getByRole('button', { name: '1W' }))

    expect(screen.getByRole('button', { name: '1W' })).toHaveClass('bg-primary')
  })

  it('renders an empty-state message when history is missing', () => {
    render(<PriceChart history={[]} variant="full" />)

    expect(screen.getByText('No chart data available.')).toBeInTheDocument()
  })

  it('draws the chart and shows a tooltip on hover', async () => {
    render(<PriceChart history={history} variant="full" layout="panel" defaultRange="1y" />)

    expect(await screen.findByRole('img', { name: /Price chart for 1y/i })).toBeInTheDocument()

    const chartArea = document.querySelector('rect.cursor-crosshair')
    expect(chartArea).not.toBeNull()
    fireEvent.mouseMove(chartArea!, { clientX: 200 })

    expect(await screen.findByText(/\$/)).toBeInTheDocument()
  })
})
