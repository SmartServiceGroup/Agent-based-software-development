import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useLocalStorage } from './useLocalStorage.js'

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear())

  it('returns default value when key is missing', () => {
    const v = useLocalStorage('k', [])
    expect(v.value).toEqual([])
  })

  it('loads existing value from storage', () => {
    localStorage.setItem('k', JSON.stringify([1, 2, 3]))
    const v = useLocalStorage('k', [])
    expect(v.value).toEqual([1, 2, 3])
  })

  it('persists changes back to storage', async () => {
    const v = useLocalStorage('k', [])
    v.value = [42]
    await nextTick()
    expect(JSON.parse(localStorage.getItem('k'))).toEqual([42])
  })
})
