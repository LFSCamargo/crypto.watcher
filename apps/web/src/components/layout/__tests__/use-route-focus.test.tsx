import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRef } from 'react'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useRouteFocus } from '../use-route-focus'

function Harness() {
  const mainRef = useRef<HTMLElement>(null)
  useRouteFocus(mainRef)
  return (
    <>
      <Link to="/next">Go next</Link>
      <main ref={mainRef} tabIndex={-1} aria-label="content">
        <Routes>
          <Route path="/" element={<p>Home</p>} />
          <Route path="/next" element={<p>Next</p>} />
        </Routes>
      </main>
    </>
  )
}

describe('useRouteFocus', () => {
  it('leaves focus alone on the initial render', () => {
    render(
      <MemoryRouter>
        <Harness />
      </MemoryRouter>,
    )
    expect(screen.getByRole('main')).not.toHaveFocus()
  })

  it('moves focus to the main region after navigation', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Harness />
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('link', { name: 'Go next' }))
    expect(await screen.findByText('Next')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveFocus()
  })
})
