import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { Reveal } from '../components/reveal'
import { LifecycleSection } from '../components/lifecycle-section'

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

it('suspends the four-second lifecycle tour outside the viewport', () => {
  vi.useFakeTimers()
  motionState.reduced = false
  const { rerender } = render(<LifecycleSection />)
  act(() => {
    screen.getByRole('button', { name: 'Play tour' }).click()
  })
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
