import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { Reveal } from '../components/reveal'
import { LifecycleSection } from '../components/lifecycle-section'
import { ReportPreviewCard } from '../components/report-preview-card'

const motionState = vi.hoisted(() => ({ reduced: true, inView: true }))

vi.mock('framer-motion', async (original) => ({
  ...(await original<typeof import('framer-motion')>()),
  useReducedMotion: () => motionState.reduced,
  useInView: () => motionState.inView,
}))

afterEach(() => {
  motionState.reduced = true
  motionState.inView = true
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it('renders revealed content immediately at its final frame', () => {
  render(
    <Reveal delay={0.4}>
      <p>Visible content</p>
    </Reveal>,
  )
  expect(screen.getByText('Visible content').parentElement).toHaveStyle({
    opacity: '1',
    transform: 'none',
  })
})

it('keeps the lifecycle manual under reduced motion, including Play', () => {
  vi.useFakeTimers()
  render(<LifecycleSection />)
  const play = screen.getByRole('button', { name: 'Play tour' })
  expect(play).toBeDisabled()
  act(() => {
    play.click()
    vi.advanceTimersByTime(12000)
  })
  expect(screen.getByRole('region', { name: /^Step 1 of 5/ })).toBeInTheDocument()
  act(() => {
    screen.getByRole('button', { name: 'Score shown' }).click()
  })
  expect(screen.getByRole('region', { name: /^Step 5 of 5/ })).toBeInTheDocument()
})

it('renders the final report score without scheduling a count-up', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  const raf = vi.spyOn(window, 'requestAnimationFrame')
  const { container } = render(<ReportPreviewCard />)
  expect(container.querySelector('[data-score]')).toHaveTextContent('82')
  expect(raf).not.toHaveBeenCalled()
  raf.mockRestore()
})

it('finishes an in-flight count-up when reduced motion is enabled', () => {
  let change: (() => void) | undefined
  const preference = {
    matches: false,
    addEventListener: (_: string, listener: () => void) => {
      change = listener
    },
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', () => preference)
  const { container } = render(<ReportPreviewCard />)
  expect(container.querySelector('[data-score]')).toHaveTextContent('0')
  act(() => {
    preference.matches = true
    change?.()
  })
  expect(container.querySelector('[data-score]')).toHaveTextContent('82')
})

it('suspends the four-second lifecycle tour outside the viewport', () => {
  vi.useFakeTimers()
  motionState.reduced = false
  const { rerender } = render(<LifecycleSection />)
  act(() => {
    vi.advanceTimersByTime(4000)
  })
  expect(screen.getByRole('region', { name: /^Step 2 of 5/ })).toBeInTheDocument()
  motionState.inView = false
  rerender(<LifecycleSection />)
  act(() => {
    vi.advanceTimersByTime(12000)
  })
  expect(screen.getByRole('region', { name: /^Step 2 of 5/ })).toBeInTheDocument()
  motionState.inView = true
  rerender(<LifecycleSection />)
  act(() => {
    vi.advanceTimersByTime(4000)
  })
  expect(screen.getByRole('region', { name: /^Step 3 of 5/ })).toBeInTheDocument()
  motionState.reduced = true
  rerender(<LifecycleSection />)
  act(() => {
    vi.advanceTimersByTime(8000)
  })
  expect(screen.getByRole('region', { name: /^Step 3 of 5/ })).toBeInTheDocument()
})
