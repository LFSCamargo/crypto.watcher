import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

class ResizeObserverMock {
  observe = () => undefined
  disconnect = () => undefined
  unobserve = () => undefined
}

class IntersectionObserverMock {
  observe = () => undefined
  disconnect = () => undefined
  unobserve = () => undefined
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)
globalThis.IntersectionObserver =
  IntersectionObserverMock as unknown as typeof IntersectionObserver
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
