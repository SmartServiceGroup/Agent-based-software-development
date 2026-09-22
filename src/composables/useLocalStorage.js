import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue) {
  let initial = defaultValue
  const stored = localStorage.getItem(key)
  if (stored !== null) {
    try {
      initial = JSON.parse(stored)
    } catch {
      initial = defaultValue
    }
  }
  const value = ref(initial)
  watch(value, (newVal) => {
    localStorage.setItem(key, JSON.stringify(newVal))
  }, { deep: true })
  return value
}
