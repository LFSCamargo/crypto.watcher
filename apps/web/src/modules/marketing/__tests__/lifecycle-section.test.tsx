import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LifecycleSection } from '../components/lifecycle-section'

class IntersectingObserver {
  constructor(private callback: IntersectionObserverCallback) {}
  observe = (target: Element) => {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }
  unobserve = () => undefined
  disconnect = () => undefined
}

const detail = () => screen.getByRole('region', { name: /^Step \d of 5/ })

describe('LifecycleSection', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('shows who acts and what you see for the chosen step', async () => {
    const user = userEvent.setup()
    render(<LifecycleSection />)

    expect(detail()).toHaveAccessibleName('Step 1 of 5: Review requested')
    await user.click(screen.getByRole('button', { name: 'Governor review' }))

    const panel = detail()
    expect(panel).toHaveAccessibleName('Step 3 of 5: Governor review')
    expect(within(panel).getByText('Who acts')).toBeInTheDocument()
    expect(within(panel).getByText('Vetted governors')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Governor review' })).toHaveAttribute(
      'aria-current',
      'step',
    )
  })

  it('tours the steps on its own once visible and can be paused', () => {
    vi.useFakeTimers()
    vi.stubGlobal('IntersectionObserver', IntersectingObserver)
    render(<LifecycleSection />)

    act(() => {
      vi.advanceTimersByTime(4100)
    })
    expect(detail()).toHaveAccessibleName('Step 2 of 5: In analysis')

    act(() => {
      screen.getByRole('button', { name: 'Pause tour' }).click()
    })
    act(() => {
      vi.advanceTimersByTime(9000)
    })
    expect(detail()).toHaveAccessibleName('Step 2 of 5: In analysis')
    expect(screen.getByRole('button', { name: 'Play tour' })).toBeInTheDocument()
  })

  it('stops the tour when the reader picks a step', async () => {
    vi.stubGlobal('IntersectionObserver', IntersectingObserver)
    const user = userEvent.setup()
    render(<LifecycleSection />)

    await user.click(screen.getByRole('button', { name: 'Score shown' }))
    expect(screen.getByRole('button', { name: 'Play tour' })).toBeInTheDocument()
    expect(detail()).toHaveAccessibleName('Step 5 of 5: Score shown')
  })
})
