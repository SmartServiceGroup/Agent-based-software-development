import { describe, it, expect, beforeEach } from 'vitest'
import { useDarkMode } from './useDarkMode.js'

describe('useDarkMode', () => {
  beforeEach(() => localStorage.clear())

  it('defaults to light mode', () => {
    const { isDark } = useDarkMode()
    expect(isDark.value).toBe(false)
  })

  it('reads persisted dark mode', () => {
    localStorage.setItem('dark-mode', 'true')
    const { isDark } = useDarkMode()
    expect(isDark.value).toBe(true)
  })

  it('toggle flips and persists selection', () => {
    const { isDark, toggle } = useDarkMode()
    toggle()
    expect(isDark.value).toBe(true)
    expect(localStorage.getItem('dark-mode')).toBe('true')
    toggle()
    expect(isDark.value).toBe(false)
    expect(localStorage.getItem('dark-mode')).toBe('false')
  })
})
