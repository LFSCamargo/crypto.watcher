import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { MiniSparkline } from '../components/mini-sparkline'

describe('MiniSparkline', () => {
  it('renders a placeholder when history is too short', () => {
    const { container } = render(<MiniSparkline history={[{ timestamp: 1, price: 100 }]} />)

    expect(container.querySelector('svg')).toBeNull()
    expect(container.querySelector('.bg-muted\\/40')).toBeTruthy()
  })

  it('renders an svg path for multi-point history', () => {
    const { container } = render(
      <MiniSparkline
        history={[
          { timestamp: 1, price: 100 },
          { timestamp: 2, price: 120 },
          { timestamp: 3, price: 110 },
        ]}
      />,
    )

    expect(container.querySelector('svg')).toBeTruthy()
    expect(container.querySelector('path')).toBeTruthy()
  })

  it('downsamples large histories and colors downward trends', () => {
    const history = Array.from({ length: 120 }, (_, index) => ({
      timestamp: index,
      price: 200 - index,
    }))

    const { container } = render(<MiniSparkline history={history} maxPoints={24} />)

    const path = container.querySelector('path')
    expect(path).toBeTruthy()
    expect(path).toHaveAttribute('stroke', 'hsl(var(--destructive))')
  })
})
