import { describe, expect, it } from 'vitest'
import { buildChartGeometry, findNearestPointIndex, getDefaultPadding } from '../lib/chart-geometry'

describe('chart geometry', () => {
  const history = [
    { timestamp: 1, price: 100 },
    { timestamp: 2, price: 120 },
    { timestamp: 3, price: 110 },
  ]

  it('maps points across the full chart width', () => {
    const geometry = buildChartGeometry(history, 320, 120, getDefaultPadding('full'))
    expect(geometry?.points[0]?.x).toBe(0)
    expect(geometry?.points.at(-1)?.x).toBe(320)
  })

  it('finds the nearest point to a hover position', () => {
    const geometry = buildChartGeometry(history, 300, 80, getDefaultPadding('compact'))
    const points = geometry?.points ?? []
    expect(findNearestPointIndex(points, points[1]!.x)).toBe(1)
    expect(findNearestPointIndex(points, points[0]!.x + 5)).toBe(0)
  })
})
