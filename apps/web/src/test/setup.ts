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
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
