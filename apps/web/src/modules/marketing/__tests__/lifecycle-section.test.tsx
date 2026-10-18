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

  it('keeps stage tabs numbered-only through tablet width', () => {
    render(<LifecycleSection />)
    const firstTab = screen.getByRole('button', { name: 'Review requested' })
    const title = within(firstTab).getByText('Review requested')

    expect(firstTab).toHaveClass('min-h-12')
    expect(firstTab.className).not.toMatch(/md:min-h-24|md:flex-col/)
    expect(title).toHaveClass('hidden', 'lg:block')
    expect(title).not.toHaveClass('md:block')
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

  it('stays manual until the tour is started and can be paused', () => {
    vi.useFakeTimers()
    vi.stubGlobal('IntersectionObserver', IntersectingObserver)
    render(<LifecycleSection />)

    act(() => {
      vi.advanceTimersByTime(8000)
    })
    expect(detail()).toHaveAccessibleName('Step 1 of 5: Review requested')
    act(() => {
      screen.getByRole('button', { name: 'Play tour' }).click()
    })
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

  it('navigates through every stage and stops at the boundaries', async () => {
    const user = userEvent.setup()
    render(<LifecycleSection />)
    expect(screen.getByRole('button', { name: 'Previous stage' })).toBeDisabled()
    for (let index = 0; index < 4; index += 1) {
      await user.click(screen.getByRole('button', { name: 'Next stage' }))
    }
    expect(detail()).toHaveAccessibleName('Step 5 of 5: Score shown')
    expect(screen.getByRole('button', { name: 'Next stage' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Previous stage' }))
    expect(detail()).toHaveAccessibleName('Step 4 of 5: Report published')
  })

  it('stops the tour when the reader picks a step', async () => {
    vi.stubGlobal('IntersectionObserver', IntersectingObserver)
    const user = userEvent.setup()
    render(<LifecycleSection />)

    await user.click(screen.getByRole('button', { name: 'Play tour' }))
    await user.click(screen.getByRole('button', { name: 'Score shown' }))
    expect(screen.getByRole('button', { name: 'Play tour' })).toBeInTheDocument()
    expect(detail()).toHaveAccessibleName('Step 5 of 5: Score shown')
  })
})
