import { ref, watch } from 'vue'

export function useDarkMode() {
  const isDark = ref(localStorage.getItem('dark-mode') === 'true')

  function apply() {
    const cls = 'dark'
    const has = document.documentElement.classList.contains(cls)
    if (isDark.value && !has) document.documentElement.classList.add(cls)
    if (!isDark.value && has) document.documentElement.classList.remove(cls)
    localStorage.setItem('dark-mode', String(isDark.value))
  }

  watch(isDark, apply, { immediate: true, flush: 'sync' })

  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}
