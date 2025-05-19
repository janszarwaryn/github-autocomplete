import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'


afterEach(() => {
  cleanup()
})


Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})


Object.defineProperty(window, 'open', {
  writable: true,
  value: vi.fn()
})
